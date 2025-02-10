import { Component, inject, Input } from '@angular/core';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { Subscription } from 'rxjs';
import { LoginService } from '../../services/firebase-services/login-service';
import { UserServiceService } from '../../services/firebase-services/user-service.service';
import { User } from '../../models/user';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './user-add.component.html',
  styleUrl: './user-add.component.scss'
})
export class UserAddComponent {
  @Input() userId: string = '';
  @Input() channelId: string = '';
  @Input() channelName: string = '';

  userAvatar: string = '';
  userName: string = '';
  userEmail: string = '';
  userStatus: string = '';

  inputValue: string = '';
  filteredUsers: User[] = [];
  listShown: boolean = false;

  channelService: ChannelServiceService = inject(ChannelServiceService);
  userService: UserServiceService = inject(UserServiceService);
  loginService: LoginService = inject(LoginService);
  searchService = inject(SearchService);

  private userSubscription: Subscription = new Subscription();
  private allUsers: User[] = [];

  constructor() {
    this.userSubscription.add(
      this.userService.getUsers().subscribe((users: User[]) => {
        this.allUsers = users;
      })
    );
  }

  onInputChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  this.inputValue = target?.value || ''; 

  if (this.inputValue.length > 0) {
    this.filteredUsers = this.searchService.filterUsersByName(this.inputValue);
    this.listShown = true;
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
}
