import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, orderBy, addDoc, serverTimestamp, doc } from '@angular/fire/firestore';
import { User } from '../../models/user';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserServiceService {

    firestore: Firestore = inject(Firestore);

    constructor() { }

    getUserRef(){
        return collection(this.firestore, 'users');
    }

    getSingleUser(colId:string, docId:string){
        return doc(collection(this.firestore,colId ),docId);
    }

    getUsers(): Observable<User[]> {
        const userRef = this.getUserRef();
        const q = query(userRef, orderBy('name'));
        return collectionData(q, { idField: 'id' }) as Observable<User[]>;
    }
}