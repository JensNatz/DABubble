import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AvatarComponent } from '../avatar/avatar.component';
import { CommonModule } from '@angular/common';
import { TruncateHtmlPipe } from '../../pipes/truncate-html.pipe';
import { LoadingIndicatorComponent } from "../loading-indicator/loading-indicator.component";
@Component({
  selector: 'app-selection-list',
  standalone: true,
  imports: [AvatarComponent, CommonModule, TruncateHtmlPipe, LoadingIndicatorComponent],
  templateUrl: './selection-list.component.html',
  styleUrl: './selection-list.component.scss'
})
export class SelectionListComponent {
  @Input() elements: Record<string, any> = {};
  @Input() size: string = 'normal';
  @Output() elementSelected = new EventEmitter<any>();

  onElementClick(element: any, categoryType: string) {
    this.elementSelected.emit({element, categoryType});
  }

  ifElementsEmpty() {
    return Object.keys(this.elements).length === 0;
  }
}
