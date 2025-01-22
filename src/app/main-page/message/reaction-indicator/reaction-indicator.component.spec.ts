import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactionIndicatorComponent } from './reaction-indicator.component';

describe('ReactionIndicatorComponent', () => {
  let component: ReactionIndicatorComponent;
  let fixture: ComponentFixture<ReactionIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactionIndicatorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReactionIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
