import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginUserAcceptedComponent } from './login-user-accepted.component';

describe('LoginUserAcceptedComponent', () => {
  let component: LoginUserAcceptedComponent;
  let fixture: ComponentFixture<LoginUserAcceptedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginUserAcceptedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoginUserAcceptedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
