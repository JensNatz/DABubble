import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipientSelectorComponent } from './recipient-selector.component';

describe('RecipientSelectorComponent', () => {
  let component: RecipientSelectorComponent;
  let fixture: ComponentFixture<RecipientSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipientSelectorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecipientSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
