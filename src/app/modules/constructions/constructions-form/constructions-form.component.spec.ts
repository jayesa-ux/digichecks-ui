import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstructionsFormComponent } from './constructions-form.component';

describe('ConstructionsFormComponent', () => {
  let component: ConstructionsFormComponent;
  let fixture: ComponentFixture<ConstructionsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConstructionsFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConstructionsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
