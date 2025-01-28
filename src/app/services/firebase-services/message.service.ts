import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, orderBy, addDoc, doc, updateDoc, arrayRemove, arrayUnion, where, getDoc } from '@angular/fire/firestore';
import { Message } from '../../models/message';
import { UserService } from '../user.service';
import { ChannelServiceService } from './channel-service.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MessagePart } from '../../models/message-part';


@Injectable({
  providedIn: 'root'
})
export class MessageService {

  firestore: Firestore = inject(Firestore);
  userService: UserService = inject(UserService);
  channelService: ChannelServiceService = inject(ChannelServiceService);
  private sanitizer = inject(DomSanitizer);
  private nameCache = new Map<string, string>();
  
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
  
  async parseContentToDisplayInHTML(content: string): Promise<SafeHtml> {
    const userIds = Array.from(content.matchAll(/@{\[([^\]]+)\]}/g)).map(match => match[1]);
    const channelIds = Array.from(content.matchAll(/#{\[([^\]]+)\]}/g)).map(match => match[1]);
    
    const userNameMap = new Map();
    const channelNameMap = new Map();

    if (userIds.length > 0) {
      const userPromises = userIds.map(async userId => {
        const userName = await this.userService.getUserName(userId);
        userNameMap.set(userId, userName);
      });
      await Promise.all(userPromises);
    }

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
    console.log(messageContent, 'messageContent');
    return this.sanitizer.bypassSecurityTrustHtml(messageContent);
  }

  async parseMessageContent(content: string): Promise<MessagePart[]> {
    const parts = this.splitMessageIntoParts(content);
    return this.resolveNames(parts);
  }

  private splitMessageIntoParts(content: string): MessagePart[] {
    const parts: MessagePart[] = [];
    let lastIndex = 0;
    const mentionPattern = /(@{\[(.*?)\]}|#{\[(.*?)\]})/g;
    let match;

    while ((match = mentionPattern.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index)
        });
      }

      if (match[2]) {
        parts.push({
          type: 'user',
          id: match[2]
        });
      } else if (match[3]) {
        parts.push({
          type: 'channel',
          id: match[3]
        });
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex)
      });
    }

    return parts;
  }

  private async resolveNames(parts: MessagePart[]): Promise<MessagePart[]> {
    return Promise.all(parts.map(async part => {
      if (part.type === 'text') return part;

      const cacheKey = `${part.type}-${part.id}`;
      let displayName = this.nameCache.get(cacheKey);

      if (!displayName) {
        if (part.type === 'user' && part.id) {
          displayName = await this.userService.getUserName(part.id);
        } else if (part.type === 'channel' && part.id) {
          displayName = await this.channelService.getChannelNameById(part.id);
        }
        if (displayName) {
          this.nameCache.set(cacheKey, displayName);
        }
      }

      return {
        ...part,
        displayName
      };
    }));
  }

  async preloadMessageNames(messages: Message[]) {
    const userIds = new Set<string>();
    const channelIds = new Set<string>();
    
    messages.forEach(message => {
      const parts = this.splitMessageIntoParts(message.content);
      parts.forEach(part => {
        if (part.type === 'user' && part.id) userIds.add(part.id);
        if (part.type === 'channel' && part.id) channelIds.add(part.id);
      });
    });

    await Promise.all([
      [...userIds].map(id => 
        this.userService.getUserName(id).then(name => 
          this.nameCache.set(`user-${id}`, name)
        )
      ),
      [...channelIds].map(id => 
        this.channelService.getChannelNameById(id).then(name => 
          this.nameCache.set(`channel-${id}`, name)
        )
      )
    ]);
  }


}
