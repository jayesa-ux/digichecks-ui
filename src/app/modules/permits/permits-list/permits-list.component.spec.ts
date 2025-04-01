import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermitsListComponent } from './permits-list.component';

describe('PermitsListComponent', () => {
  let component: PermitsListComponent;
  let fixture: ComponentFixture<PermitsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermitsListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PermitsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
