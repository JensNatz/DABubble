import { Component, inject, Input } from '@angular/core';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { Subscription } from 'rxjs';
import { LoginService } from '../../services/firebase-services/login-service';
import { UserServiceService } from '../../services/firebase-services/user-service.service';
import { User } from '../../models/user';
import { MessageBoardComponent } from '../../main-page/message-board/message-board.component';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [
    MessageBoardComponent
  ],
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
  modalService: ModalService = inject(ModalService);

  private userSubscription: Subscription = new Subscription();

  constructor( private messageBoard: MessageBoardComponent ) {

  }

  
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
  

  switchToDirectMessageChannel(userId: string) {
    this.channelService.setDirectMessageChannel(userId);
    this.modalService.closeModal();
  }
}
