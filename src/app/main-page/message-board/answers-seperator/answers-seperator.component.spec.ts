import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswersSeperatorComponent } from './answers-seperator.component';

describe('AnswersSeperatorComponent', () => {
  let component: AnswersSeperatorComponent;
  let fixture: ComponentFixture<AnswersSeperatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnswersSeperatorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnswersSeperatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
