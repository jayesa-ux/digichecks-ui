import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePermitComponent } from './create-permit.component';

describe('CreatePermitComponent', () => {
  let component: CreatePermitComponent;
  let fixture: ComponentFixture<CreatePermitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePermitComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreatePermitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
