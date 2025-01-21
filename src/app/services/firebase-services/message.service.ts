import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, orderBy, addDoc, serverTimestamp, doc, updateDoc, arrayRemove, arrayUnion } from '@angular/fire/firestore';
import { Message } from '../../models/message';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  firestore: Firestore = inject(Firestore);
  
  constructor() { }

  getMessagesSortedByTimestampASC(channelId: string) {
    const messagesRef = collection(this.firestore, `channels/${channelId}/messages`);
    const queryRef = query(messagesRef, orderBy('timestamp', 'asc'));
    return collectionData(queryRef, { idField: 'id' });
  }

  postMessageToChannel(channelId: string, message: Message) {
    const messagesRef = collection(this.firestore, `channels/${channelId}/messages`);
    addDoc(messagesRef, {
      content: message.content,
      timestamp: message.timestamp,
      author: message.author,
    });
  }

  removeReactionFromMessage(channelId: string, messageId: string, reactionType: string, userId: string) {
    const messageRef = doc(this.firestore, `channels/${channelId}/messages/${messageId}`);
    updateDoc(messageRef, {
      ///TO DO: ??? if no more reactions, remove the reaction type from the message ??? not sure if this is needed
      [`reactions.${reactionType}`]: arrayRemove(userId)
    });
  }

  addReactionToMessage(channelId: string, messageId: string, reactionType: string, userId: string) {
    const messageRef = doc(this.firestore, `channels/${channelId}/messages/${messageId}`);
    updateDoc(messageRef, {
      [`reactions.${reactionType}`]: arrayUnion(userId)
    });
  }
}
