import { Injectable, inject } from '@angular/core';
import { Firestore, collectionData, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Channel } from '../../models/channel';

@Injectable({
  providedIn: 'root'
})
export class ChannelServiceService {

  channels;
  users;
  id = "";

  firestore: Firestore = inject(Firestore);

  constructor() { 
    this.channels = collectionData(this.getChannelsRef());
    this.users = collectionData(this.getUsersRef());
  }

  async addNewChanel(item: Channel) {
    try {
      const docRef = await addDoc(this.getChannelsRef(), item);
      this.id = docRef.id;
      await updateDoc(docRef, { id: this.id });
      
    } catch (err) {
      console.error('Error adding document:', err);
    }
  }

  getChannelsRef() {
    return collection(this.firestore, 'channels');
  }

  getSingleChannelRef(chanellId: string, docId: string) {
    return doc(collection(this.firestore, chanellId), docId);
  }

  getUsersRef() {
    return collection(this.firestore, 'users');
  }

  getUserRef(userId: string, docId: string) {
    return doc(collection(this.firestore, userId), docId);
  }

}
