import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaBubbleAnimationComponent } from './da-bubble-animation.component';

describe('DaBubbleAnimationComponent', () => {
  let component: DaBubbleAnimationComponent;
  let fixture: ComponentFixture<DaBubbleAnimationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DaBubbleAnimationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DaBubbleAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
