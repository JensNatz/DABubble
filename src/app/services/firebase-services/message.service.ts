import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, orderBy, addDoc, serverTimestamp, doc, updateDoc, arrayRemove, arrayUnion, where, getDoc } from '@angular/fire/firestore';
import { Message } from '../../models/message';
import { Timestamp } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  firestore: Firestore = inject(Firestore);
  
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
}
