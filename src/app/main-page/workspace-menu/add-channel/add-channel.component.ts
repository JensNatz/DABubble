import { Component, Input, inject } from '@angular/core';
import { ChannelServiceService } from '../../../services/firebase-services/channel-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Channel } from '../../../models/channel';
import { LoginService } from '../../../services/firebase-services/login-service';
import { WorkspaceMenuComponent } from '../workspace-menu.component';
import { take } from 'rxjs/operators';
import { User } from '../../../models/user';
import { SearchService } from '../../../services/search.service';
import { Subscription } from 'rxjs';
import { UserServiceService } from '../../../services/firebase-services/user-service.service';

@Component({
  selector: 'app-add-channel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './add-channel.component.html',
  styleUrl: './add-channel.component.scss'
})
export class AddChannelComponent {

  userId: any = '';
  userName: string = '';
  channelExists: boolean = false;
  addChannel = true;
  addUser = false;
  memberOption: string = 'all'; 
  tempMembers: string[] = []; 
  inputValue: string = '';
  filteredUsers: User[] = [];
  listShown: boolean = false;
  selectedUsers: User[] = [];
  selectedUser: User | null = null;
  errorMessage: string = '';

  @Input() closeFunction!: () => void;

  channel: Channel = {
    name: "",
    description: "",
    creator: this.userName,
    members: [],
    type: 'group'
  }

  loginService: LoginService = inject(LoginService);
  workSpace: WorkspaceMenuComponent = inject(WorkspaceMenuComponent);
  searchService = inject(SearchService);
  userService: UserServiceService = inject(UserServiceService);

  private userSubscription: Subscription = new Subscription();
  private allUsers: User[] = [];

  constructor(public channelService: ChannelServiceService) {
    this.getCurrentUserData();
    
    this.userSubscription.add(
      this.userService.getUsers().subscribe((users: User[]) => {
        this.allUsers = users;
      })
    );
  }


  onInputFocus(): void {
    this.filteredUsers = this.allUsers
        .filter(user => user.name !== this.userName)      
      this.listShown = this.filteredUsers.length > 0;
  }

  
  onInputChange(event: Event): void {
    const target = event.target as HTMLDivElement;
    this.inputValue = target.innerText.trim();
  
    if (this.inputValue.length > 0) {
      this.filteredUsers = this.searchService
        .filterUsersByName(this.inputValue)
        .filter(user => user.name !== this.userName)         
  
      this.listShown = this.filteredUsers.length > 0;
    } 
  }


  getCurrentUserData() {
    this.loginService.currentUser.subscribe(user => {
      if (user) {
        this.userId = user.id;
        this.userName = user.name;
      }
    })
  }


  onAddUser(userId: string): void {
    if (!this.tempMembers.includes(userId)) {
      this.tempMembers.push(userId);
    }
  }


  async checkChannelExists() {
    if (!this.channel.name.trim()) {
      this.channelExists = false;
      return;
    }

    this.channelService.getAllChannelsFromDatabase().subscribe(channels => {
      if (channels) {
        this.channelExists = channels.some((ch: Channel) => ch.name.toLowerCase() === this.channel.name.toLowerCase());
      }
    });
  }


  onUserSelect(user: User): void {
    if (!this.channel.members) {
      this.channel.members = [];
    }
  
    if (!this.selectedUsers.some(u => u.id === user.id)) {
      this.selectedUsers.push(user);
      this.channel.members.push(user.id!); 
    }
  
    this.inputValue = '';
    const editableDiv = document.querySelector('.editable-input') as HTMLDivElement;
    if (editableDiv) {
      editableDiv.innerText = '';
    }
    this.listShown = false;   
  }


  removeSelectedUser(user: User): void {
    this.selectedUsers = this.selectedUsers.filter(u => u.id !== user.id);
    
    if (this.selectedUsers.length === 0) {
      this.errorMessage = '';
    }
  }

  onSubmit(ngForm: NgForm) {
    if (ngForm.valid && !this.channelExists) {
      this.channel = {
        name: this.channel.name,
        description: this.channel.description,
        creator: this.userName,
        members: [this.userId],
        type: 'group'
      };
  
      this.addChannel = false;
      this.addUser = true;
    }
  }

  channelSave(): void {
    if (!this.channel.members) {
      this.channel.members = [];
    }

    this.channel = {
      name: this.channel.name,
      description: this.channel.description,
      creator: this.userName,
      members: this.channel.members, 
      type: 'group'
    };

    this.channelService.addNewChannel(this.channel);
    this.closeFunction();  
  }
  
}
