import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, orderBy, addDoc, doc, updateDoc, arrayRemove, arrayUnion, where, getDoc } from '@angular/fire/firestore';
import { Message } from '../../models/message';
import { UserService } from '../user.service';
import { ChannelServiceService } from './channel-service.service';
import { MessagePart } from '../../models/message-part';
import { ViewContainerRef } from '@angular/core';
import { MentionComponent } from '../../shared/mention/mention.component';


@Injectable({
  providedIn: 'root'
})
export class MessageService {

  firestore: Firestore = inject(Firestore);
  userService: UserService = inject(UserService);
  channelService: ChannelServiceService = inject(ChannelServiceService);
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
        parts.push({type: 'text',content: content.slice(lastIndex, match.index) });
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

      return {...part, displayName};
    }));
  }

  renderMessagePartsInContainer(parts: MessagePart[], container: ViewContainerRef) {
    container.clear();
    const renderedComponents: Array<{component: any, part: MessagePart}> = [];
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
        componentRef.location.nativeElement.contentEditable = false;
        componentRef.location.nativeElement.id = `mentionid${mentionCounter++}`;
        container.element.nativeElement.appendChild(componentRef.location.nativeElement);
        renderedComponents.push({ component: componentRef, part });
      }
    });
    
    return renderedComponents;
  }
}
