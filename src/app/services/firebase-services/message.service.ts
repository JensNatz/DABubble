import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, orderBy, addDoc, doc, updateDoc, arrayRemove, arrayUnion, where, getDoc } from '@angular/fire/firestore';
import { Message } from '../../models/message';
import { UserService } from '../user.service';
import { ChannelServiceService } from './channel-service.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  firestore: Firestore = inject(Firestore);
  userService: UserService = inject(UserService);
  channelService: ChannelServiceService = inject(ChannelServiceService);
  
  constructor() { }

  getMessagesFromChannelOrderByTimestampDESC(channelId: string) {
    const messagesRef = collection(this.firestore, 'messages');
    const queryRef = query(
      messagesRef,
      where('channelId', '==', channelId),
      where('parentMessageId', '==', null),
      orderBy('timestamp', 'desc')
    );
    return collectionData(queryRef, { idField: 'id' });
  }

  getRepliesFromMessageOrderByTimestampDESC(messageId: string) {
    const messagesRef = collection(this.firestore, 'messages');
    const queryRef = query(
      messagesRef,
      where('parentMessageId', '==', messageId),
      orderBy('timestamp', 'desc')
    );
    return collectionData(queryRef, { idField: 'id' });
  }

  postMessageToChannel(channelId: string, message: Message) {
    const messagesRef = collection(this.firestore, 'messages');
    addDoc(messagesRef, {
      content: message.content,
      timestamp: message.timestamp,
      author: message.author,
      channelId: channelId,
      parentMessageId: null,
      edited: false
    });
  }

  private async updateParentMessageMetadata(parentMessageId: string, replyTimestamp: number) {
    const parentMessageRef = doc(this.firestore, 'messages', parentMessageId);
    const parentDoc = await getDoc(parentMessageRef);
    
    if (!parentDoc.exists()) {
      throw "Parent message document does not exist!";
    }

    console.log(replyTimestamp, 'replyTimestamp');

    await updateDoc(parentMessageRef, {
      numberOfReplies: (parentDoc.data()['numberOfReplies'] || 0) + 1,
      lastReplyTimestamp: replyTimestamp
    });
  }

  async postReplyToMessage(channelId: string, parentMessageId: string, message: Message) {
    const messagesRef = collection(this.firestore, 'messages');
    
    await addDoc(messagesRef, {
      content: message.content,
      timestamp: message.timestamp,
      author: message.author,
      channelId: channelId,
      parentMessageId: parentMessageId,
      edited: false
    });

    await this.updateParentMessageMetadata(parentMessageId, message.timestamp);
  }

  editMessage(messageId: string, content: string) {
    const messageRef = doc(this.firestore, 'messages', messageId);
    updateDoc(messageRef, {
      content: content,
      edited: true
    });
  }

  removeReactionFromMessage(messageId: string, reactionType: string, userId: string) {
    const messageRef = doc(this.firestore, 'messages', messageId);
    updateDoc(messageRef, {
      [`reactions.${reactionType}`]: arrayRemove(userId)
    });
  }

  addReactionToMessage(messageId: string, reactionType: string, userId: string) {
    const messageRef = doc(this.firestore, 'messages', messageId);
    updateDoc(messageRef, {
      [`reactions.${reactionType}`]: arrayUnion(userId)
    });
  }

  parseContentToStoreOnDatabase(content: string) {
    let messageContent = content
      // Parse user tags
      .replace(/<span class="message-tag"[^>]*data-user-id="([^"]+)"[^>]*>@[^<]+<\/span>/g, (match, userId) => {
        return `@{[${userId}]}`;
      })
      // Parse channel tags
      .replace(/<span class="message-tag"[^>]*data-channel-id="([^"]+)"[^>]*>#[^<]+<\/span>/g, (match, channelId) => {
        return `#{[${channelId}]}`;
      });
    return messageContent;
  }

  async parseContentToDisplayInHTML(content: string) {
    // Collect all IDs that need to be fetched
    const userIds = Array.from(content.matchAll(/@{\[([^\]]+)\]}/g)).map(match => match[1]);
    const channelIds = Array.from(content.matchAll(/#{\[([^\]]+)\]}/g)).map(match => match[1]);
    
    // Create maps for names
    const userNameMap = new Map();
    const channelNameMap = new Map();

    // Fetch user names
    if (userIds.length > 0) {
      const userPromises = userIds.map(async userId => {
        const userName = await this.userService.getUserName(userId);
        userNameMap.set(userId, userName);
      });
      await Promise.all(userPromises);
    }

    // Fetch channel names
    if (channelIds.length > 0) {
      const channelPromises = channelIds.map(async channelId => {
        const channelName = await this.channelService.getChannelNameById(channelId);
        channelNameMap.set(channelId, channelName);
      });
      await Promise.all(channelPromises);
    }

    let messageContent = content
      // Parse user tags
      .replace(/@{\[([^\]]+)\]}/g, (_, userId) => {
        const userName = userNameMap.get(userId) || 'User';
        return `<span class="message-tag-inserted" data-user-id="${userId}" contenteditable="false">@${userName}</span>`;
      })
      // Parse channel tags
      .replace(/#{\[([^\]]+)\]}/g, (_, channelId) => {
        const channelName = channelNameMap.get(channelId) || 'Channel';
        return `<span class="message-tag-inserted" data-channel-id="${channelId}" contenteditable="false">#${channelName}</span>`;
      });
    return messageContent;
  }
}
