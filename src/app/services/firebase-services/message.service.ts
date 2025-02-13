import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, orderBy, addDoc, doc, updateDoc, arrayRemove, arrayUnion, where, getDoc } from '@angular/fire/firestore';
import { Message } from '../../models/message';
import { UserService } from '../user.service';
import { ChannelServiceService } from './channel-service.service';
import { MessagePart } from '../../models/message-part';
import { ViewContainerRef } from '@angular/core';
import { MentionComponent } from '../../shared/mention/mention.component';
import { LoginService } from './login-service';
import { firstValueFrom } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class MessageService {

  firestore: Firestore = inject(Firestore);
  userService: UserService = inject(UserService);
  channelService: ChannelServiceService = inject(ChannelServiceService);
  loginService: LoginService = inject(LoginService);
  private tagNameCache = new Map<string, string>();

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

  getAllMessagesOfUser(userId: string) {
    const messagesRef = collection(this.firestore, 'messages');
    const queryRef = query(
      messagesRef,
      where('author', '==', userId),
    );
    return collectionData(queryRef, { idField: 'id' });
  }

  getAllMainMessagesOfUser(userId: string) {
    const messagesRef = collection(this.firestore, 'messages');
    const queryRef = query(
      messagesRef,
      where('author', '==', userId),
      where('parentMessageId', '==', null)
    );
    return collectionData(queryRef, { idField: 'id' });
  }

  async getMessagesFromAllChannelsOfUser(userId: string) {
    const userChannels = await this.channelService.getAllGroupChannelsWhereUserIsMember(userId);
    const channelIds = userChannels.map((channel) => channel['id']);
    if (channelIds.length === 0) {
      return [];
    }

    const messagesRef = collection(this.firestore, 'messages');
    const queryRef = query(
      messagesRef,
      where('channelId', 'in', channelIds),
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

  async parseMessageContent(content: string): Promise<MessagePart[]> {
    const parts = this.splitMessageIntoParts(content);
    const resolvedParts = await this.resolveMessageParts(parts);
    return resolvedParts;
  }

  private splitMessageIntoParts(content: string): MessagePart[] {
    const parts: MessagePart[] = [];
    let lastIndex = 0;
    const mentionPattern = /(@{\[(.*?)\]}|#{\[(.*?)\]})/g;
    let match;

    while ((match = mentionPattern.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
      }
      if (match[2]) {
        parts.push({ type: 'user', id: match[2] });
      } else if (match[3]) {
        parts.push({ type: 'channel', id: match[3] });
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) {
      parts.push({ type: 'text', content: content.slice(lastIndex) });
    }
    return parts;
  }

  private async resolveMessageParts(parts: MessagePart[]): Promise<MessagePart[]> {
    return Promise.all(parts.map(async part => {
      if (part.type === 'text' && part.id) return part;
      return await this.resolveTag(part);
    }));
  }

  async resolveTag(part: MessagePart) {
    if (!part.id) {
      part.available = false;
      return { ...part, displayName: `Unknown ${part.type.charAt(0).toUpperCase() + part.type.slice(1)}` };
    }

    const cacheKey = `${part.type}-${part.id}`;
    const cachedTagName = this.tagNameCache.get(cacheKey);

    if (cachedTagName) {
      part.displayName = cachedTagName;
      part.available = true;
    } else {
      const name = part.type === 'user'
        ? await this.userService.getUserName(part.id)
        : await this.channelService.getChannelNameById(part.id);

      part.displayName = name || `Unknown ${part.type.charAt(0).toUpperCase() + part.type.slice(1)}`;
      part.available = !!name;

      if (name) {
        this.tagNameCache.set(cacheKey, part.displayName);
      }
    }

    if (part.type === 'channel') {
      part.available = await this.checkChannelMembership(part.id);
    }

    return { ...part };
  }

  private async checkChannelMembership(channelId: string): Promise<boolean> {
    const currentUser = await firstValueFrom(this.loginService.currentUser);
    if (!currentUser?.id) {
      return false;
    }
    return this.channelService.isUserMemberOfChannel(currentUser.id, channelId);
  }

  renderMessagePartsInContainer(parts: MessagePart[], container: ViewContainerRef) {
    container.clear();
    const renderedComponents: Array<{ component: any, part: MessagePart }> = [];
    let mentionCounter = 0;

    parts.forEach(part => {
      if (part.type === 'text') {
        const textNode = document.createTextNode(part.content || '');
        container.element.nativeElement.appendChild(textNode);
      } else {
        const componentRef = container.createComponent(MentionComponent);
        componentRef.setInput('type', part.type);
        componentRef.setInput('id', part.id);
        componentRef.setInput('displayName', part.displayName);
        componentRef.setInput('available', part.available);
        componentRef.location.nativeElement.contentEditable = false;
        componentRef.location.nativeElement.id = `mentionid${mentionCounter++}`;
        container.element.nativeElement.appendChild(componentRef.location.nativeElement);
        renderedComponents.push({ component: componentRef, part });
      }
    });

    return renderedComponents;
  }
}
