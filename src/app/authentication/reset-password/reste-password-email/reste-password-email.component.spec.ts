import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestePasswordEmailComponent } from './reste-password-email.component';

describe('RestePasswordEmailComponent', () => {
  let component: RestePasswordEmailComponent;
  let fixture: ComponentFixture<RestePasswordEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestePasswordEmailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RestePasswordEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
