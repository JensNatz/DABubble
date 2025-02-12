import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAddMessageBoardComponent } from './user-add-message-board.component';

describe('UserAddMessageBoardComponent', () => {
  let component: UserAddMessageBoardComponent;
  let fixture: ComponentFixture<UserAddMessageBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAddMessageBoardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserAddMessageBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
