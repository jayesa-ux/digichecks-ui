import { Component, OnDestroy, OnInit } from '@angular/core';
import { SharedMouleModule } from '../../../shared/shared-moule.module';
import { AppServiceService } from '../../../core/services/app-service.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [SharedMouleModule],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.css',
})
export class FooterComponent implements OnInit, OnDestroy {
    isLoggedUser: boolean = false;
    appServiceSbj: Subscription;

    constructor(private appServiceService: AppServiceService) {}

    ngOnInit() {
        this.appServiceSbj = this.appServiceService.currentUser.subscribe((currentUser) => {
            this.isLoggedUser = currentUser.isLogged;
        });
    }

    ngOnDestroy(): void {
        this.appServiceSbj?.unsubscribe();
    }
}
