import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { User } from '../model/user.model';
import { Notification } from '../model/notification.model';
import sortBy from 'lodash/sortBy';
import { BPMService } from './bpm.service';

@Injectable({
    providedIn: 'root',
})
export class AppServiceService {
    private currentUserSubject: BehaviorSubject<User> = new BehaviorSubject({} as User);
    public readonly currentUser: Observable<User> = this.currentUserSubject.asObservable();
    private notificationsSubject: BehaviorSubject<Notification[]> = new BehaviorSubject({} as Notification[]);
    public readonly currentNotifications: Observable<Notification[]> = this.notificationsSubject.asObservable();

    //subscriptions
    getNotificationsSbj: Subscription;

    constructor(private bpmService: BPMService) {}

    setCurrentUser(currentUser: User): void {
        this.currentUserSubject.next(currentUser);
    }

    getCurrentUser() {
        return this.currentUserSubject.getValue();
    }

    setCurrentNotifications(notifications: Notification[]): void {
        this.notificationsSubject.next(notifications);
    }

    getCurrentNotifications() {
        return this.notificationsSubject.getValue();
    }

    getNotifications(userName: string) {
        this.getNotificationsSbj = this.bpmService.getNotifications(userName).subscribe({
            next: (response: Notification[]) => {
                this.setCurrentNotifications(sortBy(response, 'type', 'asc'));
            },
            error: (error) => {
                console.error(error);
            },
        });
    }
}
