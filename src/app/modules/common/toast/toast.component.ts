/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Toast } from 'bootstrap';
import { fromEvent, take } from 'rxjs';
import { EventTypes } from '../../../core/model/toast/evet-types';
import { SharedMouleModule } from '../../../shared/shared-moule.module';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [SharedMouleModule],
    templateUrl: './toast.component.html',
    styleUrls: ['./toast.component.scss'],
})
export class ToastComponent implements OnInit {
    @Output() disposeEvent = new EventEmitter();

    @ViewChild('toastElement', { static: true })
    toastEl!: ElementRef;

    @Input()
    type!: EventTypes;

    @Input()
    title!: string;

    @Input()
    message!: string;

    @Input()
    delay!: number;

    toast!: Toast;

    ngOnInit() {
        this.show();
    }

    show() {
        const config = {
            delay: 1500,
            autohide: true,
        };
        this.toast = new Toast(this.toastEl.nativeElement, config);
        fromEvent(this.toastEl.nativeElement, 'hidden.bs.toast')
            .pipe(take(1))
            .subscribe(() => this.hide());

        this.toast.show();
    }

    hide() {
        this.toast.dispose();
        this.disposeEvent.emit();
    }
}
