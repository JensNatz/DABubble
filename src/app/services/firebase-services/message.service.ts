import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, orderBy, addDoc, serverTimestamp, doc, updateDoc, arrayRemove, arrayUnion, where } from '@angular/fire/firestore';
import { Message } from '../../models/message';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  firestore: Firestore = inject(Firestore);
  
  constructor() { }

  getMessagesFromChannelOrderByTimestampASC(channelId: string) {
    const messagesRef = collection(this.firestore, 'messages');
    const queryRef = query(
      messagesRef,
      where('channelId', '==', channelId),
      orderBy('timestamp', 'asc')
    );
    return collectionData(queryRef, { idField: 'id' });
  }

  postMessageToChannel(channelId: string, message: Message) {
    const messagesRef = collection(this.firestore, 'messages');
    addDoc(messagesRef, {
      content: message.content,
      timestamp: message.timestamp,
      author: message.author,
      channelId: channelId
    });
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
