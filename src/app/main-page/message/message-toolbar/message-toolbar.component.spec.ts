import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageToolbarComponent } from './message-toolbar.component';

describe('MessageToolbarComponent', () => {
  let component: MessageToolbarComponent;
  let fixture: ComponentFixture<MessageToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageToolbarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MessageToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
