import { Component, Injectable, OnDestroy, OnInit } from '@angular/core';
import { SharedMouleModule } from '../../../shared/shared-moule.module';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BreadcrumbsComponent } from '../../layout/breadcrumbs/breadcrumbs.component';
import { CityHall } from '../../../core/model/cityHall.model';
import { GeneralService } from '../../../core/services/general.service';
import { Subscription } from 'rxjs';
import { ConstructionType } from '../../../core/model/constructionType.model';
import { Country } from '../../../core/model/country.model';
import { ConstructionsService } from '../../../core/services/constructions.service';
import { ToastService } from '../../../core/services/toast.service';
import { Construction } from '../../../core/model/construction.model';
import { TranslateService } from '@ngx-translate/core';
import { NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { AppServiceService } from '../../../core/services/app-service.service';
import { User } from '../../../core/model/user.model';

@Injectable()
export class CustomAdapter extends NgbDateAdapter<string> {
    readonly DELIMITER = '-';

    fromModel(value: string | null): NgbDateStruct | null {
        if (value) {
            const date = value.split(this.DELIMITER);
            return {
                day: parseInt(date[0], 10),
                month: parseInt(date[1], 10),
                year: parseInt(date[2], 10),
            };
        }
        return null;
    }

    toModel(date: NgbDateStruct | null): string | null {
        return date ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year : null;
    }
}

@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {
    readonly DELIMITER = '/';

    parse(value: string): NgbDateStruct | null {
        if (value) {
            const date = value.split(this.DELIMITER);
            return {
                day: parseInt(date[0], 10),
                month: parseInt(date[1], 10),
                year: parseInt(date[2], 10),
            };
        }
        return null;
    }

    format(date: NgbDateStruct | null): string {
        return date ? date.month + this.DELIMITER + date.day + this.DELIMITER + date.year : '';
    }
}

@Component({
    selector: 'app-constructions-form',
    standalone: true,
    imports: [SharedMouleModule, BreadcrumbsComponent, NgbDatepickerModule],
    providers: [
        GeneralService,
        { provide: NgbDateAdapter, useClass: CustomAdapter },
        { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
    ],
    templateUrl: './constructions-form.component.html',
    styleUrl: './constructions-form.component.css',
})
export class ConstructionsFormComponent implements OnInit, OnDestroy {
    currentUser: User;
    newConstructionForm: UntypedFormGroup;
    cityHallsArr: CityHall[];
    countriesArr: Country[];
    constructionTypesArr: ConstructionType[];

    cityHallsSbj: Subscription;
    countriesSbj: Subscription;
    constructionTypesSbj: Subscription;
    constructionInsertSbj: Subscription;
    appServiceSbj: Subscription;

    filesToUpload: File[] = [];

    constructor(
        private fb: FormBuilder,
        private generalService: GeneralService,
        private constructionsService: ConstructionsService,
        private toastService: ToastService,
        private translate: TranslateService,
        private router: Router,
        private appServiceService: AppServiceService
    ) {}

    get ncfc() {
        return this.newConstructionForm.controls;
    }

    ngOnInit() {
        this.appServiceSbj = this.appServiceService.currentUser.subscribe((currentUser) => {
            this.currentUser = currentUser;
            this.newConstructionForm = this.fb.group({
                name: ['', [Validators.required]],
                city: ['', [Validators.required]],
                country: ['', [Validators.required]],
                constructionType: ['', [Validators.required]],
                estimatedFinish: ['', [Validators.required]],
                shortDescription: ['', [Validators.required]],
                largeDescription: ['', [Validators.required]],
                latitude: [null, [Validators.required]],
                longitude: [null, [Validators.required]],
                group: [this.currentUser.user_group, [Validators.required]],
            });
        });

        this.getCityHalls();
        this.getCountries();
        this.getConstructionsTypes();
    }

    ngOnDestroy(): void {
        this.cityHallsSbj?.unsubscribe();
        this.countriesSbj?.unsubscribe();
        this.constructionTypesSbj?.unsubscribe();
        this.constructionInsertSbj?.unsubscribe();
        this.appServiceSbj?.unsubscribe();
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

    getCountries() {
        this.countriesSbj = this.generalService.getAllCountries().subscribe({
            next: (data) => {
                this.countriesArr = data;
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

    triggerFileInput(): void {
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        fileInput?.click();
    }

    onFileSelected(event: any): void {
        const selectedFiles = event.target.files as FileList;
        this.filesToUpload = [...this.filesToUpload, ...Array.from(selectedFiles)];
    }

    removeFile(index: number): void {
        this.filesToUpload.splice(index, 1);
    }

    createConstruction() {
        if (this.newConstructionForm.valid) {
            const formData = new FormData();

            // Añade los datos del formulario
            formData.append('constructionType', this.newConstructionForm.value.constructionType);
            formData.append('name', this.newConstructionForm.value.name);
            formData.append('shortDescription', this.newConstructionForm.value.shortDescription);
            formData.append('largeDescription', this.newConstructionForm.value.largeDescription);
            formData.append('country', this.newConstructionForm.value.country);
            formData.append('city', this.newConstructionForm.value.city);
            formData.append('latitude', this.newConstructionForm.value.latitude);
            formData.append('longitude', this.newConstructionForm.value.longitude);
            formData.append('group', this.currentUser.user_group);

            // Añade las imágenes
            if (this.filesToUpload && this.filesToUpload.length > 0) {
                this.filesToUpload.forEach((file, index) => {
                    formData.append(`images`, file, file.name);
                });
            }
            this.constructionInsertSbj = this.constructionsService.insertConstruction(formData).subscribe({
                next: (data) => {
                    this.toastService.showSuccessToast('', this.translate.instant('success.constructionSuccess'));
                    this.router.navigate(['constructions']);
                },
                error: (error) => {
                    console.error(error);
                },
            });
        } else {
            this.newConstructionForm.markAllAsTouched();
        }
    }
}
