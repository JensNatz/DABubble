import { Injectable, inject } from '@angular/core';
import { Firestore, collectionData, collection, doc, docData, onSnapshot, addDoc, updateDoc, deleteDoc, getDoc, getDocs, where, query } from '@angular/fire/firestore';
import { Channel } from '../../models/channel';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChannelServiceService {

  channels;
  users;
  id = "";

  firestore: Firestore = inject(Firestore);

  private channelNameCache = new Map<string, string>();
  currentChannel: Channel | null = null;

  constructor() { 
    this.channels = collectionData(this.getChannelsRef());
    this.users = collectionData(this.getUsersRef());

    this.currentChannel = {
      name: 'Test Channel',
      description: 'This is a test channel',
      id: '9kacAebjb6GEQZJC7jFL',
      members: ['HYyPBoR4IaheDog70se4', 'YAJxDG5vwYHoCbYjwFhb', 'ZqmYwvCFAQ1xHQf1ZRKy']
    }
  }

  getChannelById(channelId: string): Observable<Channel> {
    const channelDocRef = doc(this.firestore, `channels/${channelId}`);
    return docData(channelDocRef) as Observable<Channel>;
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

  async getChannelNameById(channelId: string) {
    if (this.channelNameCache.has(channelId)) {
      return this.channelNameCache.get(channelId);
    }
    const channelName = await getDoc(doc(this.firestore, 'channels', channelId))
      .then(doc => doc.data()?.[`name`]);
    
    if (channelName) {
      this.channelNameCache.set(channelId, channelName);
    } else {
      return 'Unknown Channel';
    }

    return channelName;
  }

  async getAllGroupChannelsWhereUserIsMember(userId: string) {
    const channels = await getDocs(query(
      collection(this.firestore, 'channels'), 
      where('members', 'array-contains', userId),
      where('type', '==', 'group')
    ));
    return channels.docs.map(doc => doc.data());
  }
}
