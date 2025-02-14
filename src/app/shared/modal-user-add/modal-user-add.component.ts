import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-modal-user-add',
  standalone: true,
  imports: [],
  templateUrl: './modal-user-add.component.html',
  styleUrl: './modal-user-add.component.scss'
})
export class ModalUserAddComponent {
  @Input() closeModal!: () => void;
}
