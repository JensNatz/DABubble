import { Component, inject, Input } from '@angular/core';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LoginService } from '../../services/firebase-services/login-service';
import { UserServiceService } from '../../services/firebase-services/user-service.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss'
})

export class UserInfoComponent {

  @Input() userId: string = '';

  userAvatar: string = '';
  userName: string = '';
  userEmail: string = '';
  userStatus: string = '';

  channelService: ChannelServiceService = inject(ChannelServiceService);
  userService: UserServiceService = inject(UserServiceService);
  loginService: LoginService = inject(LoginService);

  private userSubscription: Subscription = new Subscription();

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
