import { Component, Input } from '@angular/core';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-modal-user-add',
  standalone: true,
  imports: [],
  templateUrl: './modal-user-add.component.html',
  styleUrl: './modal-user-add.component.scss'
})
export class ModalUserAddComponent {
  // @Input() closeModal!: () => void;

  constructor( private modalService: ModalService) {}

  closeModal() {
    this.modalService.closeModal();
  }
}
