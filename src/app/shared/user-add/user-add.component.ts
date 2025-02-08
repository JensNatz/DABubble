import { Component, inject, Input } from '@angular/core';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { Subscription } from 'rxjs';
import { LoginService } from '../../services/firebase-services/login-service';
import { UserServiceService } from '../../services/firebase-services/user-service.service';
import { User } from '../../models/user';
import { MessageBoardComponent } from '../../main-page/message-board/message-board.component';

@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [],
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

  channelService: ChannelServiceService = inject(ChannelServiceService);
  userService: UserServiceService = inject(UserServiceService);
  loginService: LoginService = inject(LoginService);

  private userSubscription: Subscription = new Subscription();

  constructor() {}

  ngOnInit() {    
    if (this.userId) {
      this.userSubscription.unsubscribe();
      this.userSubscription = this.userService.getUserById(this.userId).subscribe((user: User) => {
        this.userAvatar = user.avatar;
        this.userName = user.name;
        this.userEmail = user.email;
        this.userStatus = user.onlineStatusbar;
      });
    }    
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }
}
