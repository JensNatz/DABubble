import { Component, inject, Input } from '@angular/core';
import { Subscription, take } from 'rxjs';
import { MessageBoardComponent } from '../../main-page/message-board/message-board.component';
import { User } from '../../models/user';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { LoginService } from '../../services/firebase-services/login-service';
import { UserServiceService } from '../../services/firebase-services/user-service.service';
import { SearchService } from '../../services/search.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-add-message-board',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
  ],
  templateUrl: './user-add-message-board.component.html',
  styleUrl: './user-add-message-board.component.scss'
})
export class UserAddMessageBoardComponent {

  @Input() userId: string = '';
  @Input() channelId: string = '';
  @Input() channelName: string = '';
  @Input() closeUserAddInfos!: () => void;

  inputValue: string = '';
  filteredUsers: User[] = [];
  listShown: boolean = false;
  errorMessage: string = '';

  channelService: ChannelServiceService = inject(ChannelServiceService);
  userService: UserServiceService = inject(UserServiceService);
  loginService: LoginService = inject(LoginService);
  searchService = inject(SearchService);

  private userSubscription: Subscription = new Subscription();
  private allUsers: User[] = [];

  constructor( private messageBoard: MessageBoardComponent ) {
      this.userSubscription.add(this.userService.getUsers().subscribe((users: User[]) => {
        this.allUsers = users;
      })
    );
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.inputValue = target?.value || '';
  
    if (this.inputValue.length > 0) {
      this.filteredUsers = this.searchService.filterUsersByName(this.inputValue);
      this.listShown = this.filteredUsers.length > 0; 
    } else {
      this.listShown = false;
    }
  }

  onUserSelect(user: User): void {
    this.inputValue = user.name;
    this.listShown = false;
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  addUserToChannel() {
    if (!this.channelId || !this.inputValue) {
      return;
    }
    const selectedUser = this.allUsers.find(user => user.name === this.inputValue);
    if (!selectedUser) {
      return;
    }
    const userId = selectedUser.id;
    if (userId) {
      this.channelService.getChannelById(this.channelId).pipe(take(1)).subscribe(channel => {
        if (!channel) {
          return;
        }
        const members = channel.members ?? [];
        if (members.includes(userId)) {
          this.errorMessage = 'Benutzer ist bereits Mitglied.';
          return;
        }
        const updatedMembers = [...members, userId];
        this.channelService.editChannelMembers(this.channelId, updatedMembers);
        this.messageBoard.getUserFromChannel();    
        this.closeUserAddInfos();  
      });
    }
  }
}
