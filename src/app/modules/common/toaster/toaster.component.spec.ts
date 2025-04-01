import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToasterComponent } from './toaster.component';
import { EventTypes } from '../../../core/model/toast/evet-types';

describe('ToasterComponent', () => {
    let component: ToasterComponent;
    let fixture: ComponentFixture<ToasterComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ToasterComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ToasterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should remove toasts on dispose', () => {
        // given
        component.currentToasts = [
            {
                type: EventTypes.Info,
                title: 'info',
                message: 'info',
            },
        ];

        // when
        component.dispose(0);

        // then
        expect(component.currentToasts).toEqual([]);
    });
});
