import { Component, Directive, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { SharedMouleModule } from '../../../shared/shared-moule.module';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { Paginator } from '../../../core/model/paginator.model';
import { Router } from '@angular/router';
import { BreadcrumbsComponent } from '../../layout/breadcrumbs/breadcrumbs.component';
import { PermitsService } from '../../../core/services/permits.service';
import { Permit } from '../../../core/model/permits/permit.model';
import { orderBy } from 'lodash';
import { Subscription } from 'rxjs';
import { AppServiceService } from '../../../core/services/app-service.service';
import { Notification } from '../../../core/model/notification.model';
import { BPMService } from '../../../core/services/bpm.service';
import { User } from '../../../core/model/user.model';
import { PermitHistoric } from '../../../core/model/permits/permitHistory.model';
import { HttpClient } from '@angular/common/http';

export type SortColumn = keyof Permit | '';
export type SortDirection = 'asc' | 'desc' | '';
const rotate: { [key: string]: SortDirection } = { asc: 'desc', desc: '', '': 'asc' };
export interface SortEvent {
    column: SortColumn;
    direction: SortDirection;
}

@Directive({
    selector: 'th[sortable]',
    standalone: true,
    host: {
        '[class.asc]': 'direction === "asc"',
        '[class.desc]': 'direction === "desc"',
        '(click)': 'rotate()',
    },
})
export class NgbdSortableHeader {
    @Input() sortable: SortColumn = '';
    @Input() direction: SortDirection = '';
    @Output() sort = new EventEmitter<SortEvent>();

    rotate() {
        this.direction = rotate[this.direction];
        this.sort.emit({ column: this.sortable, direction: this.direction });
    }
}

@Component({
    selector: 'app-permits-list',
    standalone: true,
    imports: [SharedMouleModule, NgbdSortableHeader, NgbPaginationModule, BreadcrumbsComponent],
    templateUrl: './permits-list.component.html',
    styleUrl: './permits-list.component.css',
})
export class PermitsListComponent implements OnInit, OnDestroy {
    @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
    @Input() constructionCode: string | null;
    @Input() currentUser: User | null;
    @Input() containerId: string;
    @Input() processId: string;

    paginatorObj: Paginator;
    permits: Permit[] = [];
    childrensInstances: any[] = [];
    permitExpanded: number | null;
    loadingChildrens: boolean;
    showStatus: string;

    users: any;

    // Subcriptions
    permitsSbj: Subscription;
    instancesSbj: Subscription;
    instanceSbj: Subscription;
    ownerSbj: Subscription;
    taskInstanceSbj: Subscription;
    logsSbj: Subscription;
    usersSbj: Subscription;

    constructor(
        private router: Router,
        private permitsService: PermitsService,
        private appService: AppServiceService,
        private bpmService: BPMService,
        private http: HttpClient
    ) {
        this.paginatorObj = {
            page: 1,
            itemsPerPage: 5,
            totalSize: 0,
        };
    }

    ngOnInit() {
        this.refresh();
        this.loadUsers();
    }

    loadUsers() {
        this.usersSbj = this.http.get<any>('assets/mocks/users.mock.json').subscribe(
            (response) => {
                this.users = response;
            },
            (error) => {
                console.error('', error);
            }
        );
    }

    ngOnDestroy(): void {
        this.permitsSbj?.unsubscribe();
        this.instancesSbj?.unsubscribe();
        this.instanceSbj?.unsubscribe();
        this.ownerSbj?.unsubscribe();
        this.taskInstanceSbj?.unsubscribe();
        this.logsSbj?.unsubscribe();
        this.usersSbj?.unsubscribe();
    }

    refresh() {
        this.permitsSbj = this.permitsService.getPermitsByConstruction(this.constructionCode!).subscribe({
            next: (response: Permit[]) => {
                this.permits = response
                    .map(
                        (permit: Permit) =>
                            new Permit(
                                permit._id,
                                permit.type,
                                permit.description,
                                permit.createDate,
                                permit.modifyDate,
                                permit.construction,
                                permit.instanceId,
                                permit.steps
                            )
                    )
                    .slice(
                        (this.paginatorObj.page - 1) * this.paginatorObj.itemsPerPage,
                        (this.paginatorObj.page - 1) * this.paginatorObj.itemsPerPage + this.paginatorObj.itemsPerPage
                    );
                this.paginatorObj.totalSize = response.length;
            },
            error: (error) => {
                console.error(error);
            },
        });
    }

    onSort(event: any) {
        this.permits = orderBy(this.permits, [event.column], [event.direction]);
    }

    expandTasks(permit: Permit) {
        const processInstanceId = permit.instanceId;
        this.loadingChildrens = true;
        this.permitExpanded = this.permitExpanded === processInstanceId ? 0 : processInstanceId;
        this.childrensInstances = [];
        let childrensInstancesAux: any[] = [];
        let notificationsIds: number[] = [];
        if (this.appService.getCurrentNotifications().length > 0) {
            notificationsIds = this.appService.getCurrentNotifications()?.map((notification: Notification) => Number(notification.process_id));
        }
        this.instancesSbj = this.bpmService.getInstances(this.containerId, this.processId).subscribe({
            next: (response) => {
                let totalInstances: any[] = [];
                if (response && response['process-instance-list']['process-instance']) {
                    totalInstances = response['process-instance-list']['process-instance'].filter(
                        (instance: any) =>
                            Number(instance['process-instance-id']._text) === processInstanceId ||
                            Number(instance['parent-instance-id']._text) === processInstanceId
                    );
                }
                if (totalInstances.length > 0) {
                    for (let instance of totalInstances) {
                        this.instanceSbj = this.bpmService
                            .getInstance(Number(instance['process-instance-id']._text), this.containerId, this.processId)
                            .subscribe({
                                next: (responseInstance) => {
                                    if (responseInstance['process-instance']['active-user-tasks']) {
                                        if (!Array.isArray(responseInstance['process-instance']['active-user-tasks']['task-summary'])) {
                                            const taskInstanceId =
                                                responseInstance['process-instance']['active-user-tasks']['task-summary']['task-id']._text;
                                            this.taskInstanceSbj = this.bpmService
                                                .getTaskInstance(Number(taskInstanceId), this.containerId, this.processId)
                                                .subscribe((responseTaskInstance) => {
                                                    let status = responseTaskInstance['task-instance']['task-status']._text;
                                                    const proccessId = Number(responseInstance['process-instance']['process-instance-id']._text);
                                                    this.ownerSbj = this.bpmService
                                                        .getOwner(
                                                            Number(responseInstance['process-instance']['process-instance-id']._text),
                                                            this.containerId,
                                                            this.processId
                                                        )
                                                        .subscribe({
                                                            next: (responseOwner) => {
                                                                if (notificationsIds.includes(proccessId)) {
                                                                    status = 'ActionRequired';
                                                                }
                                                                childrensInstancesAux.push({
                                                                    instanceId: Number(
                                                                        responseInstance['process-instance']['process-instance-id']._text
                                                                    ),
                                                                    description:
                                                                        responseInstance['process-instance']['active-user-tasks']['task-summary'][
                                                                            'task-name'
                                                                        ]._text,
                                                                    status: status,
                                                                    owners: responseOwner,
                                                                });
                                                                this.childrensInstances = orderBy(childrensInstancesAux, ['instanceId'], ['asc']);
                                                            },
                                                            error: (error) => {
                                                                console.error(error);
                                                                this.loadingChildrens = false;
                                                            },
                                                        });
                                                });
                                        } else {
                                            const tasks = responseInstance['process-instance']['active-user-tasks']['task-summary'];
                                            tasks.forEach((task, index) => {
                                                const taskInstanceId = task['task-id']._text;
                                                const taskName = task['task-name']._text;
                                                this.taskInstanceSbj = this.bpmService
                                                    .getTaskInstance(Number(taskInstanceId), this.containerId, this.processId)
                                                    .subscribe((responseTaskInstance) => {
                                                        let status = responseTaskInstance['task-instance']['task-status']._text;
                                                        const proccessId = Number(responseInstance['process-instance']['process-instance-id']._text);
                                                        this.ownerSbj = this.bpmService
                                                            .getOwner(
                                                                Number(responseInstance['process-instance']['process-instance-id']._text),
                                                                this.containerId,
                                                                this.processId,
                                                                index
                                                            )
                                                            .subscribe({
                                                                next: (responseOwner) => {
                                                                    if (notificationsIds.includes(proccessId)) {
                                                                        status = 'ActionRequired';
                                                                    }
                                                                    childrensInstancesAux.push({
                                                                        instanceId: Number(
                                                                            responseInstance['process-instance']['process-instance-id']._text
                                                                        ),
                                                                        description: taskName,
                                                                        status: status,
                                                                        owners: responseOwner,
                                                                        taskInstanceID: taskInstanceId,
                                                                    });
                                                                    this.childrensInstances = orderBy(childrensInstancesAux, ['instanceId'], ['asc']);
                                                                },
                                                                error: (error) => {
                                                                    console.error(error);
                                                                    this.loadingChildrens = false;
                                                                },
                                                            });
                                                    });
                                            });
                                        }
                                    }
                                },
                                error: (error) => {
                                    console.error(error);
                                    this.loadingChildrens = false;
                                },
                            });
                    }
                } else {
                    this.logsSbj = this.bpmService.getLog(processInstanceId).subscribe({
                        next: (response: PermitHistoric[]) => {
                            const rejection = response.find((log) => log.Description === 'rejected');
                            this.showStatus = rejection ? 'rejected' : 'complete';
                        },
                        error: (error) => {
                            console.error(error);
                        },
                    });
                }

                setTimeout(() => {
                    this.loadingChildrens = false;
                }, 750);
            },
            error: (error) => {
                console.error(error);
                this.loadingChildrens = false;
            },
        });
    }

    editPermit(instanceId: number, taskInstanceID?: number) {
        if (!taskInstanceID) {
            this.router.navigate([`construction/${this.constructionCode}/permit/edit`, instanceId]);
        } else {
            this.router.navigate([`construction/${this.constructionCode}/permit/edit`, instanceId, taskInstanceID]);
        }
    }

    permitHistory(instanceId: number) {
        this.router.navigate([`construction/${this.constructionCode}/permit/history/${instanceId}`]);
    }
}
