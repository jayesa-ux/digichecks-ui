import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstructionsListComponent } from './constructions-list.component';

describe('ConstructionsListComponent', () => {
  let component: ConstructionsListComponent;
  let fixture: ComponentFixture<ConstructionsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConstructionsListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConstructionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
