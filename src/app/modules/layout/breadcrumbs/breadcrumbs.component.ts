import { Component, OnInit } from '@angular/core';
import { SharedMouleModule } from '../../../shared/shared-moule.module';
import { Observable } from 'rxjs';
import { Breadcrumb } from '../../../core/model/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AppServiceService } from '../../../core/services/app-service.service';
import { AuthenticationService } from '../../../core/services/authentication.service';

@Component({
    selector: 'app-breadcrumbs',
    standalone: true,
    imports: [SharedMouleModule],
    providers: [BreadcrumbService],
    templateUrl: './breadcrumbs.component.html',
    styleUrl: './breadcrumbs.component.css',
})
export class BreadcrumbsComponent implements OnInit {
    breadcrumbs$: Observable<Breadcrumb[]>;
    breadcrumbsSize: number;
    colorArrowBack: string;

    constructor(
        private router: Router,
        private readonly breadcrumbService: BreadcrumbService,
        private _location: Location,
        private appService: AppServiceService,
        private authenticationService: AuthenticationService
    ) {
        this.breadcrumbs$ = breadcrumbService.breadcrumbs$;
        this.breadcrumbsSize = breadcrumbService._breadcrumbsSize$.getValue();
    }

    ngOnInit() {
        const userRole = this.authenticationService.getUserRole()!;
        this.colorArrowBack = this.authenticationService.getColorForRole([userRole])!;
    }

    navigate(url: string) {
        this.router.navigate([url]);
    }

    navigateBack() {
        this._location.back();
    }
}
