import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagSelectionListComponent } from './tag-selection-list.component';

describe('TagSelectionListComponent', () => {
  let component: TagSelectionListComponent;
  let fixture: ComponentFixture<TagSelectionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagSelectionListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TagSelectionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
