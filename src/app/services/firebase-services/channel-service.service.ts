import { Injectable, inject } from '@angular/core';
import { Firestore, collectionData, collection, doc, docData, addDoc, updateDoc, getDoc, getDocs, where, query, QueryDocumentSnapshot, DocumentData } from '@angular/fire/firestore';
import { Channel } from '../../models/channel';
import { Observable, BehaviorSubject, Subject, Subscription } from 'rxjs';
import { LoginService } from './login-service';
import { Message } from '../../models/message';
import { filter, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChannelServiceService {

  id: string ='';
  channels;
  users;

  firestore: Firestore = inject(Firestore);

  loginService: LoginService = inject(LoginService);

  private channelNameCache = new Map<string, string>();
  private currentChannelSubject = new BehaviorSubject<Channel | null>(null);
  currentChannel$ = this.currentChannelSubject.asObservable();

  messageRendered = new Subject<string>();

  private currentScrollSubscription?: Subscription; 

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


  getUserChannels(userId: string) {
    const channelsRef = collection(this.firestore, 'channels');
    const q = query(channelsRef, 
      where('members', 'array-contains', userId),
      where('type', '==', 'group'));
    return collectionData(q, { idField: 'id' });
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

    const members = this.determineDirectMessageChannelMembers(userId);
    if (!members) return;
    const channels = await this.findExistingDirectMessageChannel(members);

    if (!channels.empty) {
      const existingChannel = this.getDirectChannelData(channels.docs[0]);
      this.currentChannel = existingChannel;
    } else {
    const newChannel = await this.createNewDirectMessageChannel(members);
    this.currentChannel = newChannel;
    }
  }

  private determineDirectMessageChannelMembers(userId: string) {
    const loggedInUserId = this.loginService.currentUserValue?.id;
    if (!loggedInUserId) return;

    return userId === loggedInUserId 
        ? [userId] 
        : [userId, loggedInUserId].sort(); 
  }

  private findExistingDirectMessageChannel(members: string[]) {
    const channelsRef = collection(this.firestore, 'channels');
    const q = query(channelsRef, 
      where('members', '==', members),
      where('type', '==', 'direct'));
    return getDocs(q);
  }

  private getDirectChannelData(doc: QueryDocumentSnapshot<DocumentData>): Channel {
    const channelData = doc.data();
    return {
      id: doc.id,
      name: channelData['name'],
      description: channelData['description'],
      members: channelData['members'],
      type: channelData['type']
    } as Channel;
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


  editChannelName(channelId: string, name: string) {
    const channelsRef = doc(this.firestore, 'channels', channelId);
    updateDoc(channelsRef, {
      name: name
    });
  }


  editChannelDescription(channelId: string, description: string) {
    const channelsRef = doc(this.firestore, 'channels', channelId);
    updateDoc(channelsRef, {
      description: description
    });
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


  async removeUserFromChannel(channelId: string, userId: string) {
    const channelRef = doc(this.firestore, 'channels', channelId);
    const channelDoc = await getDoc(channelRef);
    
    if (!channelDoc.exists()) {
      console.error('Channel not found');
      return;
    }
    
    const channelData = channelDoc.data();
    if (!channelData || !channelData['members']) {
      console.error('Invalid channel data');
      return;
    }
    
    const updatedMembers = channelData['members'].filter((id: string) => id !== userId);
    await updateDoc(channelRef, { members: updatedMembers });
  }

  async jumpToMessage(message: Message) {
    if(message.parentMessageId === null && message.id)  {
      this.setCurrentChannelById(message.channelId);
      this.scrollToMessage(message.id);
    } 
  }

  private scrollToMessage(messageId: string) {
    if (this.currentScrollSubscription) {
      this.currentScrollSubscription.unsubscribe();
      this.currentScrollSubscription = undefined;
    }
    
    const element = document.getElementById('message-' + messageId);
    if (element) {
      this.scrollElementIntoView(element);
      this.highlightMessage(element);
      return;
    }

    this.currentScrollSubscription = this.messageRendered
      .pipe(
        filter(renderedId => renderedId === messageId)
      )
      .subscribe({
        next: () => {
          const element = document.getElementById('message-' + messageId);
          if (element) {
            this.scrollElementIntoView(element);
            this.highlightMessage(element);
          } 
        }
      });
  }

  private scrollElementIntoView(element: HTMLElement): void {
    element.scrollIntoView({ 
      behavior: 'instant',
      block: 'center',
      inline: 'center'
    });
  }

  private highlightMessage(element: HTMLElement): void {
    element.classList.add('selected-message');
    setTimeout(() => {
      element.classList.remove('selected-message');
    }, 1500);
  }
}


