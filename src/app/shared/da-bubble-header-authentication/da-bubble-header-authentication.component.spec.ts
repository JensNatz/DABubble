import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaBubbleHeaderAuthenticationComponent } from './da-bubble-header-authentication.component';

describe('DaBubbleHeaderAuthenticationComponent', () => {
  let component: DaBubbleHeaderAuthenticationComponent;
  let fixture: ComponentFixture<DaBubbleHeaderAuthenticationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DaBubbleHeaderAuthenticationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DaBubbleHeaderAuthenticationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
