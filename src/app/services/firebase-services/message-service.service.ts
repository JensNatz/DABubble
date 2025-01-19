import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, orderBy, addDoc, serverTimestamp } from '@angular/fire/firestore';
import { Message } from '../../models/message';

@Injectable({
  providedIn: 'root'
})
export class MessageServiceService {

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
}
