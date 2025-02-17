import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private firestore: Firestore) { }

  private async fetchUserData(userId: string): Promise<any> {
    const userDoc = await getDoc(doc(this.firestore, 'users', userId));
    const userData = userDoc.data();
    if (userData) {
      return userData;
    }
    return null;
  }

  async getUserName(userId: string): Promise<string | null> {
    const userData = await this.fetchUserData(userId);
    return userData?.name || null;
  }

  async getUserAvatar(userId: string): Promise<string> {
    const userData = await this.fetchUserData(userId);
    return userData?.avatar || '0';
  }

  async getCompleteUserInfo(userId: string) {
    const userData = await this.fetchUserData(userId);
    return userData;
  }
}
