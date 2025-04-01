import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstructionsDetailComponent } from './constructions-detail.component';

describe('ConstructionsDetailComponent', () => {
  let component: ConstructionsDetailComponent;
  let fixture: ComponentFixture<ConstructionsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConstructionsDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConstructionsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
