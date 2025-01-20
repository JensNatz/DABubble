import { Injectable, inject } from '@angular/core';
import { Firestore, collectionData, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Channel } from '../../models/channel';

@Injectable({
  providedIn: 'root'
})
export class ChannelServiceService {

  channels;
  firestore: Firestore = inject(Firestore);

  constructor() { 
    this.channels = collectionData(this.getChannelsRef());
  }

  async addNewChanel(item: Channel) {
    await addDoc(this.getChannelsRef(), item).catch(
      (err) => {console.log(err)}
    ).then(
      (docRef) => {console.log(docRef?.id);
      }
    )    
    
  }

  getChannelsRef() {
    return collection(this.firestore, 'channels');
  }

  getSingleChannelRef(chanellId: string, docId: string) {
    return doc(collection(this.firestore, chanellId), docId);
  }

}
