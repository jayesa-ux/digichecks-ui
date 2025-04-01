import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermitsListTimelineComponent } from './permits-list-timeline.component';

describe('PermitsListTimelineComponent', () => {
  let component: PermitsListTimelineComponent;
  let fixture: ComponentFixture<PermitsListTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermitsListTimelineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PermitsListTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
