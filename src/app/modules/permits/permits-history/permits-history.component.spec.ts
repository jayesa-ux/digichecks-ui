import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermitsHistoryComponent } from './permits-history.component';

describe('PermitsHistoryComponent', () => {
  let component: PermitsHistoryComponent;
  let fixture: ComponentFixture<PermitsHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermitsHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PermitsHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
