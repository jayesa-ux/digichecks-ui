import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { SharedMouleModule } from '../../../shared/shared-moule.module';
import { Subscription } from 'rxjs';
import { AppServiceService } from '../../../core/services/app-service.service';
import { TranslateService } from '@ngx-translate/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { Router } from '@angular/router';
import { User } from '../../../core/model/user.model';
import { BPMService } from '../../../core/services/bpm.service';
import { Notification } from '../../../core/model/notification.model';
import { ToastService } from '../../../core/services/toast.service';
import { orderBy } from 'lodash';

export interface Lang {
    code: string;
    lang: string;
}

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [SharedMouleModule, NgbDropdownModule],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
    currentUser: User;
    isLoggedUser: boolean = false;
    arrLang: Lang[] = [
        { code: 'en', lang: 'ENG' },
        { code: 'es', lang: 'ESP' },
        { code: 'de', lang: 'DEU' },
    ];
    currentLang: Lang | undefined;
    initials: string;
    notifications: Notification[] = [];
    notificationToDelete: Notification;

    //Subscriptions
    appServiceSbj: Subscription;
    notificationsSbj: Subscription;
    deleteNotificationSbj: Subscription;

    constructor(
        private appService: AppServiceService,
        private translateService: TranslateService,
        private authenticationService: AuthenticationService,
        private router: Router,
        private bpmService: BPMService,
        private toastService: ToastService
    ) {}

    ngOnInit() {
        this.notificationsSbj = this.appService.currentNotifications.subscribe((notifications) => {
            this.notifications = orderBy(notifications, ['parent_id'], ['desc']);
        });
        this.appServiceSbj = this.appService.currentUser.subscribe((currentUser) => {
            this.isLoggedUser = currentUser.isLogged;
            this.currentUser = currentUser;
            this.initials = currentUser?.user_name_complete
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase();
        });
        this.currentLang = this.arrLang.find((item) => item.code === this.translateService.currentLang);
    }

    ngOnDestroy(): void {
        this.appServiceSbj?.unsubscribe();
        this.notificationsSbj?.unsubscribe();
        this.deleteNotificationSbj?.unsubscribe();
    }

    ngAfterViewInit(): void {
        if (this.currentUser?.user_name) {
            this.getNotifications(this.currentUser.user_name);
        }
    }

    changeLanguage(lang: Lang) {
        this.translateService.setDefaultLang(lang.code);
        this.translateService.use(lang.code);
        this.translateService.reloadLang(lang.code);
        this.currentLang = lang;
    }

    logout() {
        this.authenticationService.logout();
        this.router.navigate(['login']);
    }

    getNotifications(userName: string) {
        this.appService.getNotifications(userName);
    }

    setNotification(notification: Notification) {
        this.notificationToDelete = notification;
    }

    deleteNotification() {
        this.deleteNotificationSbj = this.bpmService.deleteNotification(this.notificationToDelete.id).subscribe({
            next: (response: any) => {
                this.getNotifications(this.currentUser.user_name);
                this.toastService.showSuccessToast('', this.translateService.instant('success.notificationDeleteSuccess'));
            },
            error: (error) => {
                console.error(error);
            },
        });
    }

    navigate() {
        if (
            this.currentUser.user_role.some((role: any) => role.includes('applicants')) ||
            this.currentUser.user_role.some((role: any) => role.includes('ecologists'))
        ) {
            this.router.navigate(['constructions']);
        } else {
            this.router.navigate(['permits']);
        }
    }

    navigatePermit(parentID: string, processID: string) {
        this.router.navigate(['permit/edit', parentID, processID]);
    }

    navigateDocuments() {
        this.router.navigate(['/documents']);
    }
}
