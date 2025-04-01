import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ToastEvent } from '../model/toast/toast-events';
import { EventTypes } from '../model/toast/evet-types';

@Injectable({
    providedIn: 'root',
})
export class ToastService {
    toastEvents: Observable<ToastEvent>;
    private _toastEvents = new Subject<ToastEvent>();

    constructor() {
        this.toastEvents = this._toastEvents.asObservable();
    }

    /**
     * Show success toast notification.
     * @param title Toast title
     * @param message Toast message
     */
    showSuccessToast(title: string, message: string) {
        this._toastEvents.next({
            message,
            title,
            type: EventTypes.Success,
            delay: 1000,
        });
    }

    /**
     * Show info toast notification.
     * @param title Toast title
     * @param message Toast message
     */
    showInfoToast(title: string, message: string) {
        this._toastEvents.next({
            message,
            title,
            type: EventTypes.Info,
            delay: 1000,
        });
    }

    /**
     * Show warning toast notification.
     * @param title Toast title
     * @param message Toast message
     */
    showWarningToast(title: string, message: string) {
        this._toastEvents.next({
            message,
            title,
            type: EventTypes.Warning,
            delay: 1000,
        });
    }

    /**
     * Show error toast notification.
     * @param title Toast title
     * @param message Toast message
     */
    showErrorToast(title: string, message: string) {
        this._toastEvents.next({
            message,
            title,
            type: EventTypes.Error,
            delay: 1000,
        });
    }
}
