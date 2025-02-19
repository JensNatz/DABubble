import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PwResetAcceptedComponent } from './pw-reset-accepted.component';

describe('PwResetAcceptedComponent', () => {
  let component: PwResetAcceptedComponent;
  let fixture: ComponentFixture<PwResetAcceptedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PwResetAcceptedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PwResetAcceptedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
