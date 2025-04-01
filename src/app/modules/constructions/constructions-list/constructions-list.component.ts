import { Component, OnDestroy, OnInit } from '@angular/core';
import { SharedMouleModule } from '../../../shared/shared-moule.module';
import { BreadcrumbsComponent } from '../../layout/breadcrumbs/breadcrumbs.component';
import { Router } from '@angular/router';
import { NgbCarouselConfig, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { Paginator } from '../../../core/model/paginator.model';
import { Construction } from '../../../core/model/construction.model';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { CityHall } from '../../../core/model/cityHall.model';
import { ConstructionType } from '../../../core/model/constructionType.model';
import { MapComponent } from '../../common/map/map.component';
import { GeneralService } from '../../../core/services/general.service';
import { Subscription } from 'rxjs';
import { Marker } from '../../../core/model/map/marker.model';
import { AppServiceService } from '../../../core/services/app-service.service';
import { User } from '../../../core/model/user.model';
import { ConstructionsService } from '../../../core/services/constructions.service';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-constructions-list',
    standalone: true,
    imports: [SharedMouleModule, BreadcrumbsComponent, NgbPaginationModule, MapComponent, NgbCarouselModule],
    templateUrl: './constructions-list.component.html',
    styleUrl: './constructions-list.component.css',
})
export class ConstructionsListComponent implements OnInit, OnDestroy {
    currentUser: User;
    allowNewConstruction: boolean;
    paginatorObj: Paginator;
    constructions: Construction[] = [];
    filteredConstructions: Construction[] = [];
    cityHallsArr: CityHall[];
    constructionTypesArr: ConstructionType[];
    lisViewCheck: boolean = false;
    filterConstructions: UntypedFormGroup;

    constructionsSbj: Subscription;
    cityHallsSbj: Subscription;
    constructionTypesSbj: Subscription;
    appServiceSbj: Subscription;

    mapMarkers: Marker[];

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private appServiceService: AppServiceService,
        private generalService: GeneralService,
        private constructionsService: ConstructionsService
    ) {
        this.paginatorObj = {
            page: 1,
            itemsPerPage: 5,
            totalSize: 0,
        };
    }

    ngOnInit() {
        this.appServiceSbj = this.appServiceService.currentUser.subscribe((currentUser) => {
            this.currentUser = currentUser;
            this.allowNewConstruction = currentUser.user_role.some((role: any) => role.includes('applicants'));
        });
        this.filterConstructions = this.fb.group({
            cityHall: ['', []],
            constructionType: ['', []],
        });
        this.getConstructions();
        this.getCityHalls();
        this.getConstructionsTypes();
        this.refresh();
        this.filterConstructions.valueChanges.subscribe((values) => {
            this.filteredConstructions = this.constructions.filter(
                (construction) =>
                    (values.cityHall ? construction.city[0]._id === values.cityHall : true) &&
                    (values.constructionType ? construction.constructionType[0]._id === values.constructionType : true)
            );
            this.mapMarkers = this.constructions
                .filter(
                    (construction) =>
                        (values.cityHall ? construction.city[0]._id === values.cityHall : true) &&
                        (values.constructionType ? construction.constructionType[0]._id === values.constructionType : true)
                )
                .map((construction) => {
                    return {
                        name: construction.city[0].name,
                        latitude: construction.latitude,
                        longitude: construction.longitude,
                    };
                });
        });
    }

    get clfc() {
        return this.filterConstructions.controls;
    }

    ngOnDestroy(): void {
        this.constructionsSbj?.unsubscribe();
        this.cityHallsSbj?.unsubscribe();
        this.constructionTypesSbj?.unsubscribe();
        this.appServiceSbj?.unsubscribe();
    }

    getConstructions() {
        this.constructionsSbj = this.constructionsService.getConstructionsByGroup([this.currentUser.user_group]).subscribe({
            next: (data) => {
                this.constructions = data.map((item) => ({
                    ...item,
                    shortDescription: this.replaceText(item.shortDescription),
                    largeDescription: this.truncateText(item.largeDescription),
                }));
                this.filteredConstructions = data.map((item) => ({
                    ...item,
                    shortDescription: this.replaceText(item.shortDescription),
                    largeDescription: this.truncateText(item.largeDescription),
                }));
                this.mapMarkers = data.map((construction) => {
                    return {
                        name: construction.city[0].name,
                        latitude: construction.latitude,
                        longitude: construction.longitude,
                    };
                });
            },
            error: (error) => {
                console.error(error);
            },
        });
    }

    getCityHalls() {
        this.cityHallsSbj = this.generalService.getAllCityHalls().subscribe({
            next: (data) => {
                this.cityHallsArr = data;
            },
            error: (error) => {
                console.error(error);
            },
        });
    }

    getConstructionsTypes() {
        this.constructionTypesSbj = this.generalService.getAllConstructionTypes().subscribe({
            next: (data) => {
                this.constructionTypesArr = data;
            },
            error: (error) => {
                console.error(error);
            },
        });
    }

    constructionDetail(constructionCode: string) {
        this.router.navigate([`construction/${constructionCode}`]);
    }

    refresh() {
        this.constructions = this.constructions.slice(
            (this.paginatorObj.page - 1) * this.paginatorObj.itemsPerPage,
            (this.paginatorObj.page - 1) * this.paginatorObj.itemsPerPage + this.paginatorObj.itemsPerPage
        );
        this.paginatorObj.totalSize = this.constructions.length;
    }

    insertConstruction() {
        this.router.navigate([`construction/new`]);
    }

    truncateText(text: string, maxLength: number = 230): string {
        if (text.length <= maxLength) {
            return text;
        }
        return text.slice(0, maxLength) + '...';
    }

    replaceText(text: string): string {
        return text.replaceAll(/\\n/g, '\n');
    }
}
