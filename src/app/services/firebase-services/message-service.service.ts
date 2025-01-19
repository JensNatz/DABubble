import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, orderBy } from '@angular/fire/firestore';

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
}
