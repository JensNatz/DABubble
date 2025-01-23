import { Directive, ElementRef, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[clickOutside]',
  standalone: true
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) { }

  @HostListener('document:click', ['$event'])
  public onClick(event: MouseEvent) {
    const path = event.composedPath && event.composedPath();
    if (path ? path.includes(this.elementRef.nativeElement) : this.elementRef.nativeElement.contains(event.target as Node)) {
      return;
    }
    this.clickOutside.emit();
  }
} 
