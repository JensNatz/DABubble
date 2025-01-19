import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userCache: Map<string, any> = new Map();

  constructor(private firestore: Firestore) {}

  private async fetchUserData(userId: string): Promise<any> {
    const userDoc = await getDoc(doc(this.firestore, 'users', userId));
    const userData = userDoc.data();
    if (userData) {
      this.userCache.set(userId, userData);
      return userData;
    }
    return null;
  }

  async getUserName(userId: string): Promise<string> {
    if (this.userCache.has(userId)) {
      return this.userCache.get(userId).name;
    }
    const userData = await this.fetchUserData(userId);
    return userData?.name || 'Unknown User';
  }

  async getUserAvatar(userId: string): Promise<string> {
    if (this.userCache.has(userId)) {
      return this.userCache.get(userId).avatar;
    }

    const userData = await this.fetchUserData(userId);
    return userData?.avatar || '0';
  }
}
