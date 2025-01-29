import { Injectable, inject } from '@angular/core';
import { Firestore, collectionData, collection, doc, docData, addDoc, updateDoc, getDoc, getDocs, where, query } from '@angular/fire/firestore';
import { Channel } from '../../models/channel';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChannelServiceService {

  channels;
  users;
  id = "";

  firestore: Firestore = inject(Firestore);

  private channelNameCache = new Map<string, string>();
  private currentChannelSubject = new BehaviorSubject<Channel | null>(null);
  currentChannel$ = this.currentChannelSubject.asObservable();

  constructor() { 
    this.channels = collectionData(this.getChannelsRef());
    this.users = collectionData(this.getUsersRef());
    //TODO: einen Start Channel setzen
    // this.currentChannelSubject.next({
    //   name: 'Test Channel',
    //   description: 'This is a test channel',
    //   id: '9kacAebjb6GEQZJC7jFL',
    //   members: ['HYyPBoR4IaheDog70se4', 'YAJxDG5vwYHoCbYjwFhb', 'ZqmYwvCFAQ1xHQf1ZRKy']
    // });
  }

  get currentChannel(): Channel | null {
    return this.currentChannelSubject.getValue();
  }

  set currentChannel(channel: Channel | null) {
    this.currentChannelSubject.next(channel);
  }

  getAllChannelsFromDatabase() {
    const channelsRef = collection(this.firestore, 'channels');
    return collectionData(channelsRef, { idField: 'id' });
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

  async setDirectMessageChannel(userId: string) {
    const loggedInUserId = 'lMLhqCH6j71UrMluL6Ob'; // Hardcoded for now
    const members = [userId, loggedInUserId].sort(); // Sort to ensure consistent order
    const channels = await getDocs(query(
      collection(this.firestore, 'channels'),
      where('type', '==', 'direct'),
      where('members', '==', members)
    ));

    if (!channels.empty) {
      const channelData = channels.docs[0].data();
      const channel: Channel = {
        id: channels.docs[0].id,
        name: channelData[`name`],
        description: channelData[`description`],
        members: channelData[`members`],
        type: channelData[`type`]
      };
     // console.log(channelData);
      this.currentChannel = channel;
    } else {
     const newChannel = await this.createNewDirectMessageChannel(members);
     this.currentChannel = newChannel;
    }
  }

  async createNewDirectMessageChannel(members: string[]) {
    console.log('creating new direct message channel');
    const newChannel: Channel = {
      members: members,
      type: 'direct',
      name: 'Direct Message',
      description: '',
      id: ''
    };
    
    const channelRef = await addDoc(collection(this.firestore, 'channels'), newChannel);
    await updateDoc(channelRef, { id: channelRef.id });
    
    const channelSnap = await getDoc(channelRef);
    return { id: channelRef.id, ...channelSnap.data() } as Channel;
  }
}

