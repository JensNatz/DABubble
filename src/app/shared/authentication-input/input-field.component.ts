import { Component, Input } from '@angular/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-input-field',
  standalone: true,
  imports:[CommonModule],
  templateUrl: './input-field.component.html',
  styleUrls: ['./input-field.component.scss']
})
export class InputFieldComponent {

  @Input() type: string = 'text';
  @Input() value: string = '';
  @Input() placeholder: string = '';
  @Input() pattern: any ="";
  @Input() showError: boolean = false;
  @Input() errorMessage: string = '';
  @Input() imagePath: string = '';
ngStyle: any;

}
