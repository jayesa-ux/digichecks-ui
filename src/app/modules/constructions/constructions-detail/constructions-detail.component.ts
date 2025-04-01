import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SharedMouleModule } from '../../../shared/shared-moule.module';
import { BreadcrumbsComponent } from '../../layout/breadcrumbs/breadcrumbs.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Construction } from '../../../core/model/construction.model';
import { PermitsListComponent } from '../../permits/permits-list/permits-list.component';
import { PermitsListTimelineComponent } from '../../permits/permits-list-timeline/permits-list-timeline.component';
import { BPMService } from '../../../core/services/bpm.service';
import { PermitsService } from '../../../core/services/permits.service';
import { PermitCreate } from '../../../core/model/permits/permitCreate.model';
import { AppServiceService } from '../../../core/services/app-service.service';
import { Observable, Subscription } from 'rxjs';
import { User } from '../../../core/model/user.model';
import { ConstructionsService } from '../../../core/services/constructions.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-constructions-detail',
    standalone: true,
    imports: [SharedMouleModule, BreadcrumbsComponent, PermitsListComponent, PermitsListTimelineComponent, NgbCarouselModule],
    templateUrl: './constructions-detail.component.html',
    styleUrl: './constructions-detail.component.css',
})
export class ConstructionsDetailComponent implements OnInit, OnDestroy {
    @ViewChild('btnCloseModal') btnCloseModal: ElementRef;
    @ViewChild('appPermitsList') appPermitsList: PermitsListComponent;

    constructionCode: string | null;
    construction: Construction;
    containerId: string;
    processId: string;
    timelineViewCheck: boolean = false;
    currentUser: User;
    allowNewPermit: boolean;
    loading: boolean;

    // Subcriptions
    appServiceSbj: Subscription;
    permitsSbj: Subscription;
    constructionsSbj: Subscription;

    constructor(
        private route: ActivatedRoute,
        private toastService: ToastService,
        private bpmService: BPMService,
        private permitsService: PermitsService,
        private appServiceService: AppServiceService,
        private constructionsService: ConstructionsService,
        private translateService: TranslateService
    ) {}

    ngOnInit() {
        this.constructionCode = this.route.snapshot.paramMap.get('constructionId');

        this.appServiceSbj = this.appServiceService.currentUser.subscribe((currentUser) => {
            this.currentUser = currentUser;
            this.allowNewPermit = currentUser.user_role.some((role: any) => role.includes('applicants'));
        });

        this.constructionsSbj = this.constructionsService.getconstruction(this.constructionCode!).subscribe({
            next: (data: Construction[]) => {
                this.construction = data[0];
                this.construction.shortDescription = data[0].shortDescription.replaceAll(/\\n/g, '\n');
                this.containerId = data[0].constructionType[0].bpmConfig.containerId;
                this.processId = data[0].constructionType[0].bpmConfig.processId;
            },
            error: (error) => {
                console.error(error);
            },
        });
    }

    ngOnDestroy(): void {
        this.appServiceSbj?.unsubscribe();
        this.permitsSbj?.unsubscribe();
        this.constructionsSbj?.unsubscribe();
    }

    createAnimalPermit(permitType: string) {
        this.loading = true;
        const payload: any = { permitType: permitType };
        this.bpmService.createNewInstance(permitType, this.containerId, this.processId).subscribe((responseNewInstance) => {
            if (responseNewInstance) {
                // Create a new instance and obtein InstanceId
                const newInstanceId: string = responseNewInstance.toString();

                this.bpmService.getInstances(this.containerId, this.processId).subscribe((responseInstances) => {
                    const parent = responseInstances['process-instance-list']['process-instance'].find(
                        (instance: any) => instance['process-instance-id']._text === newInstanceId && instance['parent-instance-id']._text === '-1'
                    );

                    this.bpmService.getInstance(parent['process-instance-id']._text, this.containerId, this.processId).subscribe({
                        next: (responseInstance) => {
                            const taskId = responseInstance['process-instance']['active-user-tasks']['task-summary']['task-id']._text;

                            this.bpmService.completeAutoprogress(taskId, payload, this.containerId, this.processId).subscribe({
                                next: (responseAuto) => {
                                    const newPermit: PermitCreate = new PermitCreate(
                                        permitType,
                                        '',
                                        new Date(),
                                        new Date(),
                                        this.construction.code!,
                                        Number(newInstanceId)
                                    );
                                    this.permitsSbj = this.permitsService.insertPermit(newPermit).subscribe({
                                        next: (responseInsert) => {
                                            this.appServiceService.getNotifications(this.currentUser.user_name);
                                            this.loading = false;
                                            this.btnCloseModal.nativeElement.click();
                                            this.toastService.showSuccessToast('', this.translateService.instant('permits.permitCreated'));
                                            this.appPermitsList.refresh();
                                        },
                                        error: (error) => {
                                            console.error(error);
                                        },
                                    });
                                },
                                error: (error) => {
                                    console.error(error);
                                },
                            });
                        },
                        error: (error) => {
                            console.error(error);
                        },
                    });
                });
            } else {
                this.loading = false;
                this.btnCloseModal.nativeElement.click();
                this.toastService.showErrorToast('Error', this.translateService.instant('errors.httpErrorGeneral'));
            }
        });
    }

    createElectricalPermit() {
        this.loading = true;
        this.bpmService.createNewInstance(this.construction.constructionType[0].permitTypes[0], this.containerId, this.processId).subscribe({
            next: (responseNewInstance) => {
                const newPermit: PermitCreate = new PermitCreate(
                    this.construction.constructionType[0].permitTypes[0],
                    '',
                    new Date(),
                    new Date(),
                    this.construction.code!,
                    Number(responseNewInstance)
                );
                this.permitsSbj = this.permitsService.insertPermit(newPermit).subscribe({
                    next: (responseInsert) => {
                        this.appServiceService.getNotifications(this.currentUser.user_name);
                        this.toastService.showSuccessToast('', this.translateService.instant('permits.permitCreated'));
                        this.appPermitsList.refresh();
                    },
                    error: (error) => {
                        console.error(error);
                    },
                });
            },
            error: (error) => {
                console.error(error);
            },
        });
    }

    createBuildingPermit() {
        this.loading = true;
        this.bpmService.createNewInstance(this.construction.constructionType[0].permitTypes[0], this.containerId, this.processId).subscribe({
            next: (responseNewInstance) => {
                const newPermit: PermitCreate = new PermitCreate(
                    this.construction.constructionType[0].permitTypes[0],
                    '',
                    new Date(),
                    new Date(),
                    this.construction.code!,
                    Number(responseNewInstance)
                );
                this.permitsSbj = this.permitsService.insertPermit(newPermit).subscribe({
                    next: (responseInsert) => {
                        this.appServiceService.getNotifications(this.currentUser.user_name);
                        this.toastService.showSuccessToast('', this.translateService.instant('permits.permitCreated'));
                        this.appPermitsList.refresh();
                    },
                    error: (error) => {
                        console.error(error);
                    },
                });
            },
            error: (error) => {
                console.error(error);
            },
        });
    }
}
