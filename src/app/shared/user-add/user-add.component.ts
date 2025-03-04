import { Component, inject, Input } from '@angular/core';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { Subscription } from 'rxjs';
import { LoginService } from '../../services/firebase-services/login-service';
import { UserServiceService } from '../../services/firebase-services/user-service.service';
import { User } from '../../models/user';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../services/search.service';
import { take } from 'rxjs/operators';
import { AddUserToChannelComponent } from '../add-user-to-channel/add-user-to-channel.component';
import { ModalService } from '../../services/modal.service';


@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    AddUserToChannelComponent
  ],
  templateUrl: './user-add.component.html',
  styleUrl: './user-add.component.scss'
})
export class UserAddComponent {

  @Input() userId: string = '';
  @Input() channelId: string = '';
  @Input() channelName: string = '';
  @Input() closeUserAddInfos!: () => void;

  inputValue: string = '';
  filteredUsers: User[] = [];
  listShown: boolean = false;
  errorMessage: string = '';
  selectedUser: User | null = null;
  selectedUsers: User[] = [];
  currentName: string  = '';

  channelService: ChannelServiceService = inject(ChannelServiceService);
  userService: UserServiceService = inject(UserServiceService);
  loginService: LoginService = inject(LoginService);
  searchService = inject(SearchService);
  modalServe = inject(ModalService);

  private userSubscription: Subscription = new Subscription();
  private allUsers: User[] = [];


  constructor(private addUserComponent: AddUserToChannelComponent) {
    this.userSubscription.add(
      this.userService.getUsers().subscribe((users: User[]) => {
        this.allUsers = users;
      })
    );
    this.getCurrentUserData();    
  }


  onInputFocus(): void {
    this.channelService.getChannelById(this.channelId).pipe(take(1)).subscribe(channel => {
      if (!channel) {
        return;
      }
  
      const members = channel.members ?? [];

      this.filteredUsers = this.allUsers
        .filter(user => user.name !== this.currentName)
        .filter(user => user.id !== undefined && !members.includes(user.id));
      
      this.listShown = this.filteredUsers.length > 0;
    });
  }


  onInputChange(event: Event): void {
    const target = event.target as HTMLDivElement;
    this.inputValue = target.innerText.trim();
  
    if (this.inputValue.length > 0) {
      this.channelService.getChannelById(this.channelId).pipe(take(1)).subscribe(channel => {
        if (!channel) {
          return;
        }
  
        const members = channel.members ?? [];
  
        this.filteredUsers = this.searchService
          .filterUsersByName(this.inputValue)
          .filter(user => user.name !== this.currentName)
          .filter(user => user.id !== undefined && !members.includes(user.id));
  
        this.listShown = this.filteredUsers.length > 0;
      });
    } else {
      this.onInputFocus(); 
    }
  }


  onUserSelect(user: User): void {
    if (!this.selectedUsers.some(u => u.id === user.id)) {
      this.selectedUsers.push(user);
    }
    this.inputValue = '';
    const editableDiv = document.querySelector('.editable-input') as HTMLDivElement;
    if (editableDiv) {
      editableDiv.innerText = '';
    }
    this.listShown = false;
  }


  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }


  removeSelectedUser(user: User): void {
    this.selectedUsers = this.selectedUsers.filter(u => u.id !== user.id);
    
    if (this.selectedUsers.length === 0) {
      this.errorMessage = '';
    }
  }


  getCurrentUserData() {
    this.loginService.currentUser.subscribe(user => {
      if (user) {
        this.currentName = user.name;
      }
    })
  }


  addUserToChannel() {
    if (!this.channelId || this.selectedUsers.length === 0) {
      return;
    }

    this.channelService.getChannelById(this.channelId).pipe(take(1)).subscribe(channel => {
      if (!channel) {
        return;
      }

      let members = channel.members ?? [];
      let newUsers = this.selectedUsers.filter(user => user.id !== undefined && !members.includes(user.id as string));
     
      const updatedMembers = [...members, ...newUsers.map(user => user.id as string)].filter(id => id !== undefined);
      this.channelService.editChannelMembers(this.channelId, updatedMembers);
      this.modalServe.triggerRefreshChannelUsers();
      this.addUserComponent.getUserFromChannel();

      if (this.closeUserAddInfos) {
        this.closeUserAddInfos();
      } else {
        this.modalServe.closeModal();
      }

      this.selectedUsers = [];
      this.errorMessage = '';
    });
  }

}