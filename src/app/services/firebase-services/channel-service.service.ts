import { Injectable, inject } from '@angular/core';
import { Firestore, collectionData, collection, doc, docData, addDoc, updateDoc, getDoc, getDocs, where, query } from '@angular/fire/firestore';
import { Channel } from '../../models/channel';
import { Observable, BehaviorSubject } from 'rxjs';
import { LoginService } from './login-service';

@Injectable({
  providedIn: 'root'
})
export class ChannelServiceService {

  channels;
  users;

  firestore: Firestore = inject(Firestore);

  loginService: LoginService = inject(LoginService);

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

  setCurrentChannelById(channelId: string) {
    this.getChannelById(channelId).subscribe(channel => {
      this.currentChannelSubject.next(channel);
    });
  }

  getAllChannelsFromDatabase() {
    const channelsRef = collection(this.firestore, 'channels');
    return collectionData(channelsRef, { idField: 'id' });
  }

  getChannelById(channelId: string): Observable<Channel> {
    const channelDocRef = doc(this.firestore, `channels/${channelId}`);
    return docData(channelDocRef) as Observable<Channel>;
  }

  async addNewChannel(item: Channel) {
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

  async getChannelNameById(channelId: string): Promise<string | null> {
    if (this.channelNameCache.has(channelId)) {
      return this.channelNameCache.get(channelId)!;
    }
    
    const channelDoc = await getDoc(doc(this.firestore, 'channels', channelId));
    const channelName = channelDoc.data()?.[`name`];
    
    if (channelName) {
      this.channelNameCache.set(channelId, channelName);
      return channelName;
    }
    
    return null; 
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
    const loggedInUserId = this.loginService.currentUserValue?.id;
    if (!loggedInUserId) return;

    const members = userId === loggedInUserId 
        ? [userId] 
        : [userId, loggedInUserId].sort(); 
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
      this.currentChannel = channel;
    } else {
    const newChannel = await this.createNewDirectMessageChannel(members);
    this.currentChannel = newChannel;
    }
  }

  async createNewDirectMessageChannel(members: string[]) {
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

  async isUserMemberOfChannel(userId: string, channelId: string): Promise<boolean> {
    const channel = await getDoc(doc(this.firestore, 'channels', channelId));
    const channelData = channel.data();
    if (!channelData) return false;
    return channelData['members'].includes(userId);
  }
  

  async getMembersOfChannel(channelId: string) {
    const channelMembers = await getDoc(doc(this.firestore, 'channels', channelId))
      .then(doc => doc.data()?.[`members`]);

    return channelMembers;
  }


  async getMembersOfChannelWithDetails(channelId: string) {
    const channelDoc = await getDoc(doc(this.firestore, 'channels', channelId));
    const memberIds: string[] = channelDoc.data()?.['members'] || [];   
  
    if (memberIds.length === 0) return [];
    const userDocs = await Promise.all(
      memberIds.map(userId => getDoc(doc(this.firestore, 'users', userId)))
    );      
    const membersData = userDocs
      .map(userDoc => userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null)
      .filter(user => user !== null);
    return membersData;
  }
}


