import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ToastEvent } from '../../../core/model/toast/toast-events';
import { ToastService } from '../../../core/services/toast.service';
import { SharedMouleModule } from '../../../shared/shared-moule.module';
import { ToastComponent } from '../toast/toast.component';

@Component({
    selector: 'app-toaster',
    standalone: true,
    imports: [SharedMouleModule, ToastComponent],
    templateUrl: './toaster.component.html',
    styleUrls: ['./toaster.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToasterComponent implements OnInit {
    currentToasts: ToastEvent[] = [];

    constructor(
        private toastService: ToastService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.subscribeToToasts();
    }

    subscribeToToasts() {
        this.toastService.toastEvents.subscribe((toasts) => {
            const currentToast: ToastEvent = {
                type: toasts.type,
                title: toasts.title,
                message: toasts.message,
                delay: 1000,
            };
            this.currentToasts.push(currentToast);
            this.cdr.detectChanges();
        });
    }

    dispose(index: number) {
        this.currentToasts.splice(index, 1);
        this.cdr.detectChanges();
    }
}
