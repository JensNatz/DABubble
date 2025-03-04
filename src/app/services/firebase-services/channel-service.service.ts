import { Injectable, inject, OnDestroy } from '@angular/core';
import { Firestore, collectionData, collection, doc, docData, addDoc, updateDoc, getDoc, getDocs, where, query, QueryDocumentSnapshot, DocumentData, arrayUnion } from '@angular/fire/firestore';
import { Channel } from '../../models/channel';
import { Observable, BehaviorSubject, Subject, Subscription } from 'rxjs';
import { LoginService } from './login-service';
import { Message } from '../../models/message';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChannelServiceService implements OnDestroy {

  id: string = '';
  channels;
  users;

  firestore: Firestore = inject(Firestore);
  loginService: LoginService = inject(LoginService);

  private currentChannelSubject = new BehaviorSubject<Channel | null>(null);
  currentChannel$ = this.currentChannelSubject.asObservable();
  private currentChannelSubscription: Subscription = new Subscription();

  private threadOpenStateSubject = new BehaviorSubject<boolean>(false);
  threadOpenState$ = this.threadOpenStateSubject.asObservable();

  private threadParentMessageIdSubject = new BehaviorSubject<string | null>(null);
  threadParentMessageId$ = this.threadParentMessageIdSubject.asObservable();

  messageRendered = new Subject<string>();

  private currentScrollSubscription?: Subscription;

  constructor() {
    this.channels = collectionData(this.getChannelsRef());
    this.users = collectionData(this.getUsersRef());
  }

  ngOnDestroy() {
    this.cleanUpChannelSubscription();
  }

  get currentChannelValue(): Channel | null {
    return this.currentChannelSubject.value;
  }

  setThreadOpenState(state: boolean) {
    this.threadOpenStateSubject.next(state);
  }

  setThreadParentMessageId(messageId: string | null) {
    this.threadParentMessageIdSubject.next(messageId);
  }

  private cleanUpChannelSubscription() {
    if (this.currentChannelSubscription) {
      this.currentChannelSubscription.unsubscribe();
    }
  }

  clearCurrentChannel() {
    this.cleanUpChannelSubscription();
    this.currentChannelSubject.next(null);
  }

  setCurrentChannel(channel: Channel) {
    if (channel.id) {
      this.setCurrentChannelById(channel.id); 
    }
  }

  setCurrentChannelById(channelId: string) {
    this.cleanUpChannelSubscription();
    this.currentChannelSubscription = docData(doc(this.firestore, `channels/${channelId}`))
      .subscribe(channelData => {
        if (channelData) {
          this.currentChannelSubject.next({ id: channelId, ...channelData } as Channel);
        }
      });
  }

  getAllChannelsFromDatabase(): Observable<Channel[]> {
    const channelsRef = collection(this.firestore, 'channels');
    return collectionData(channelsRef, { idField: 'id' }) as Observable<Channel[]>;
  }

  getChannelById(channelId: string): Observable<Channel> {
    const channelDocRef = doc(this.firestore, `channels/${channelId}`);
    return docData(channelDocRef) as Observable<Channel>;
  }

  getChannelByName(channelName: string): Observable<Channel> {
    const channelDocRef = doc(this.firestore, `channels/${channelName}`);
    return docData(channelDocRef) as Observable<Channel>;
  }

  async getChannelByIdOnce(channelId: string): Promise<Channel | null> {
    const channelDocRef = doc(this.firestore, `channels/${channelId}`);
    const snapshot = await getDoc(channelDocRef);
    return snapshot.exists() ? (snapshot.data() as Channel) : null;
  }

  async addNewChannel(item: Channel) {
    try {
      const docRef = await addDoc(this.getChannelsRef(), item);
      this.id = docRef.id;
      await updateDoc(docRef, { id: this.id });
      return this.id;

    } catch (err) {
      console.error('Error adding document:', err);
      return null;
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
    const channelDoc = await getDoc(doc(this.firestore, 'channels', channelId));
    const channelName = channelDoc.data()?.[`name`];

    if (channelName) {
      return channelName;
    }

    return null;
  }


  getChannelByIdFromCollection(channelId: string): Observable<Channel | null> {
    const channelRef = doc(this.firestore, 'channels', channelId);
    return docData(channelRef, { idField: 'id' }) as Observable<Channel | null>;
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
      this.setCurrentChannel(existingChannel);
    } else {
      const newChannel = await this.createNewDirectMessageChannel(members);
      this.setCurrentChannel(newChannel);
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
    if (!channelId) {
        return [];
    }
    const channelDoc = await getDoc(doc(this.firestore, 'channels', channelId));
    if (!channelDoc.exists()) {
        return [];
    }
    const memberIds: string[] = channelDoc.data()?.['members'] || [];

    if (memberIds.length === 0) {
        return [];
    }
    const userDocs = await Promise.all(
        memberIds.map(async (userId) => {
            if (!userId) {
                return null;
            }
            const userDoc = await getDoc(doc(this.firestore, 'users', userId));
            return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
        })
    );
    const membersData = userDocs.filter((user) => user !== null) as { id: string; [key: string]: any }[];
    return membersData;
}

  
  private async addUserToChannel(channelId: string, userId: string) {
    const channelRef = doc(this.firestore, 'channels', channelId);
    await updateDoc(channelRef, {
      members: arrayUnion(userId)
    });
  }

  async addUserToWelcomeChannel(userId: string) {
    const welcomeChannelId = 't8O3yiCShX4jTjm9Kanc';
    await this.addUserToChannel(welcomeChannelId, userId);
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


  editChannelMembers(channelId: string, members: string[]) {
    const channelRef = doc(this.firestore, 'channels', channelId);
    updateDoc(channelRef, { members })
  }


  async jumpToMessage(message: Message) {
    if(message.id){
      this.setCurrentChannelById(message.channelId);
      if (message.parentMessageId !== null) {
        this.setThreadParentMessageId(message.parentMessageId);
        this.setThreadOpenState(true);
      } 
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


