import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserServiceService } from '../../services/firebase-services/user-service.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [RouterModule,FormsModule,CommonModule ],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss'
})
export class AvatarComponent {

  name: string = '';
  email: string = '';
  password: string = '';
  avatar: string = '';

  avatarImages={
    '1': '../../../assets/img/avatar1.svg',
    '2': '../../../assets/img/avatar2.svg',
    '3': '../../../assets/img/avatar3.svg',
    '4': '../../../assets/img/avatar4.svg',
    '5': '../../../assets/img/avatar5.svg',
    '6': '../../../assets/img/avatar6.svg'
  }


  constructor(private route: ActivatedRoute, private UserServiceService: UserServiceService) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.name = params['name'];
      this.email = params['email'];
      this.password = params['password'];
    });
  }
  

  selectedAvatar: string = '../../../assets/img/standard_avatar.svg';
  userName: string = 'Stephan Zager';

  selectAvatar(avatar: string) {
    this.selectedAvatar = avatar;
  }


  async registerUser() {
    const newUser: User = {
      name: this.name,
      email: this.email,
      password: this.password,
      avatar: this.avatar,
      onlineStatusbar: 'offline'
    };

    try {
      await this.UserServiceService.addNewUser(newUser);
      console.log('Benutzer erfolgreich registriert');
    } catch (err) {
      console.error('Fehler bei der Registrierung des Benutzers:', err);
    }
  }
}
