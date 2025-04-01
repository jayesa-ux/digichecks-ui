import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { SharedMouleModule } from '../../../shared/shared-moule.module';
import { BreadcrumbsComponent } from '../../layout/breadcrumbs/breadcrumbs.component';
import { Observable, Subscription } from 'rxjs';
import { TimelineComponent } from '../../common/timeline/timeline.component';
import { BPMService } from '../../../core/services/bpm.service';
import { FormioForm, FormioModule } from '@formio/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { PermitUpdate } from '../../../core/model/permits/permitUpdate.model';
import { AppServiceService } from '../../../core/services/app-service.service';
import { PermitsService } from '../../../core/services/permits.service';
import { User } from '../../../core/model/user.model';
import { Notification } from '../../../core/model/notification.model';
import sortBy from 'lodash/sortBy';
import isEmpty from 'lodash/isEmpty';
import { ConstructionsService } from '../../../core/services/constructions.service';
import { Construction } from '../../../core/model/construction.model';
import { Permit } from '../../../core/model/permits/permit.model';
import { PermitUpdateDate } from '../../../core/model/permits/permitUpdateDate.model';

@Component({
    selector: 'app-create-permit',
    standalone: true,
    imports: [SharedMouleModule, BreadcrumbsComponent, TimelineComponent, FormioModule],
    templateUrl: './create-permit.component.html',
    styleUrl: './create-permit.component.css',
})
export class CreatePermitComponent implements OnInit, OnDestroy, AfterViewInit {
    loadingForm = true;
    formOutputConfig: FormioForm = {};
    formInputConfig: FormioForm = {};
    formInputs: any[];
    metaTitle: string;
    metaTitleList: string[] = [];
    buttons: any[];
    payload: any = {};
    instanceId: string | null;
    parentId: string | null;
    taskId: string | null;
    workItemPosition: number;
    constructionId: string | null;
    construction: Construction;
    permit: Permit;
    parentInstanceId: string | null;
    permitType: string | null;
    taskInstanceId: string | null;
    taskStatus: string | null;
    taskInstanceName: string | null;
    taskDescription: string | null;
    processName: string | null;
    processDescription: string | null;
    currentUser: User;
    isCompleted: boolean;
    users: string[] = [];
    groups: string[] = [];
    includeOnGroups: boolean;
    containerId: string;
    processId: string;

    // Subcriptions
    generalServiceSbj: Subscription;
    appServiceSbj: Subscription;
    notificationsSbj: Subscription;
    permitsSbj: Subscription;
    ownerSbj: Subscription;
    constructionsSbj: Subscription;
    permitSbj: Subscription;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private appService: AppServiceService,
        private bpmService: BPMService,
        private toastService: ToastService,
        private translateService: TranslateService,
        private permitsService: PermitsService,
        private appServiceService: AppServiceService,
        private constructionsService: ConstructionsService,
        private translate: TranslateService
    ) {
        this.appServiceSbj = this.appServiceService.currentUser.subscribe((currentUser) => {
            this.currentUser = currentUser;
        });
    }

    ngOnInit() {
        this.constructionId = this.route.snapshot.paramMap.get('constructionId');
        this.instanceId = this.route.snapshot.paramMap.get('instanceId');
        this.parentId = this.route.snapshot.paramMap.get('parentId');
        this.taskId = this.route.snapshot.paramMap.get('taskid');

        if (this.constructionId) {
            this.constructionsSbj = this.constructionsService.getconstruction(this.constructionId!).subscribe({
                next: (data: Construction[]) => {
                    this.construction = data[0];
                    this.containerId = data[0].constructionType[0].bpmConfig.containerId;
                    this.processId = data[0].constructionType[0].bpmConfig.processId;
                    this.getTask();
                },
                error: (error) => {
                    console.error(error);
                },
            });
        } else {
            this.permitSbj = this.permitsService.getPermitsByParentId(this.parentId!).subscribe({
                next: (data: Permit[]) => {
                    this.constructionsSbj = this.constructionsService.getconstruction(data[0].construction!).subscribe({
                        next: (data: Construction[]) => {
                            this.constructionId = data[0].code!;
                            this.construction = data[0];
                            this.containerId = data[0].constructionType[0].bpmConfig.containerId;
                            this.processId = data[0].constructionType[0].bpmConfig.processId;
                            this.getTask();
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

    ngOnDestroy(): void {
        this.generalServiceSbj?.unsubscribe();
        this.appServiceSbj?.unsubscribe();
        this.notificationsSbj?.unsubscribe();
        this.ownerSbj?.unsubscribe();
        this.constructionsSbj?.unsubscribe();
        this.permitSbj?.unsubscribe();
    }

    ngAfterViewInit(): void {}

    getTask() {
        this.bpmService.getInstance(Number(this.instanceId), this.containerId, this.processId).subscribe({
            next: (responseInstance) => {
                this.taskStatus = 'InProgress';
                let notificationsIds: number[] = [];
                if (this.appService.getCurrentNotifications().length > 0) {
                    notificationsIds = this.appService
                        .getCurrentNotifications()
                        ?.map((notification: Notification) => Number(notification.process_id));
                }
                this.parentInstanceId = responseInstance['process-instance']['parent-instance-id']._text;

                if (!this.taskId) {
                    this.taskInstanceId = responseInstance['process-instance']['active-user-tasks']['task-summary']['task-id']._text;
                } else {
                    this.workItemPosition = responseInstance['process-instance']['active-user-tasks']['task-summary'].findIndex(
                        (task: any) => task['task-id']._text === this.taskId
                    );
                    this.taskInstanceId = this.taskId;
                }

                this.bpmService.getTaskInstance(Number(this.taskInstanceId), this.containerId, this.processId).subscribe((taskInstanceResponse) => {
                    this.taskInstanceName = taskInstanceResponse['task-instance']['task-name']._text;
                    this.taskDescription = taskInstanceResponse['task-instance']['task-description']._text;
                    this.bpmService.getTaskForm(Number(this.taskInstanceId), this.containerId, this.processId).subscribe((taskFormResponse) => {
                        setTimeout(() => {
                            this.getOwner(Number(this.instanceId), this.workItemPosition).subscribe({
                                next: (responseOwner) => {
                                    if (notificationsIds.includes(Number(this.instanceId))) {
                                        this.taskStatus = 'ActionRequired';
                                    }
                                    this.users = responseOwner.users;
                                    this.groups = responseOwner.groups;
                                    this.getNotifications();
                                    this.buildForm(taskFormResponse);
                                },
                                error: (error) => {
                                    console.error(error);
                                },
                            });
                        }, 1000);
                    });
                });
            },
            error: (error) => {
                console.error(error);
            },
        });
    }

    // function to process array
    extractUsersAndGroupsFromArray(arr: string[]) {
        const allUsers = new Set();
        const allGroups = new Set();

        arr.forEach((item) => {
            const { users, groups } = this.extractFromString(item);
            users.forEach((user) => allUsers.add(user));
            groups.forEach((group) => allGroups.add(group));
        });
        return { users: Array.from(allUsers), groups: Array.from(allGroups) };
    }

    // function to extract users and groups
    extractFromString(str: string) {
        const userRegex = /users:([^|]*)/;
        const groupRegex = /groups:([^|\]]*)/;

        const usersMatch = userRegex.exec(str);
        const groupsMatch = groupRegex.exec(str);

        const users = usersMatch && usersMatch[1] ? usersMatch[1].split(',').filter(Boolean) : [];
        const groups = groupsMatch && groupsMatch[1] ? groupsMatch[1].split(',').filter(Boolean) : [];

        return { users, groups };
    }

    buildForm(taskForm: any) {
        let paths: any[];
        let names: any[];
        this.formInputs = taskForm.components.filter(
            (component: any) =>
                component.dataType === 'input' &&
                component.name !== 'meta_title' &&
                component.name !== 'meta_titles_list' &&
                !component.name.includes('_paths') &&
                !component.name.includes('_names')
        );

        // Get path to pretty print json
        paths = taskForm.components.filter(
            (component: any) => component.dataType === 'input' && component.name !== 'meta_title' && component.name.includes('_paths')
        );
        // Get names to pretty print json
        names = taskForm.components.filter(
            (component: any) => component.dataType === 'input' && component.name !== 'meta_title' && component.name.includes('_names')
        );
        // actual step process
        this.metaTitle = taskForm.components.find(
            (component: any) => component.dataType === 'input' && component.name === 'meta_title'
        )?.defaultValue;

        // steps list process
        let metaTitleListAux = taskForm.components.find(
            (component: any) => component.dataType === 'input' && component.name === 'meta_titles_list'
        )?.defaultValue;
        if (metaTitleListAux) {
            let cleanedText = metaTitleListAux.replaceAll(/\\/g, '');
            this.metaTitleList = JSON.parse(cleanedText.replace(/'/g, '"'));
        } else {
            //Get current permit
            const parentInstanceId: number = Number(this.parentInstanceId) !== -1 ? Number(this.parentInstanceId) : Number(this.instanceId);
            this.permitsSbj = this.permitsService.findByInstanceId(parentInstanceId).subscribe({
                next: (permit: Permit) => {
                    this.metaTitleList = permit.steps;
                },
                error: (error) => {
                    console.error(error);
                },
            });
        }

        const inputsParams = this.formInputs;
        const outputParams = taskForm.components.filter((component: any) => component.dataType === 'output');
        outputParams.forEach((item: any) => {
            if (item.type === 'select') delete item.dataType;
        });

        switch (this.taskStatus) {
            case 'Ready':
                this.buttons = taskForm.components.filter((component: any) => component.type === 'button' && component.label === 'Claim');
                break;
            case 'Reserved':
                this.buttons = taskForm.components.filter(
                    (component: any) => component.type === 'button' && (component.label === 'Start' || component.label === 'Release')
                );
                break;
            case 'InProgress':
                this.buttons = taskForm.components.filter(
                    (component: any) =>
                        component.type === 'button' && (component.label === 'Complete' || component.label === 'Stop' || component.label === 'Save')
                );
                break;
        }

        const inputsMap = inputsParams.map((input: any) => {
            input.disabled = true;
            input['customClass'] = 'col-4';
            input['defaultValue'] = input['defaultValue'].replace(/'/g, '"').replace(/\\/g, '').replace(/;/g, '');

            if (this.isJSON(input['defaultValue'])) {
                const findedpaths = paths.find((path) => path.name === `${input['name']}_paths`);
                const findednames = names.find((format) => format.name === `${input['name']}_names`);

                if (findedpaths && findednames) {
                    const strPaths = findedpaths['defaultValue'].replace(/'/g, '"').replace(/\\/g, '').replace(/;/g, '');
                    const strNames = findednames['defaultValue'].replace(/'/g, '"').replace(/\\/g, '').replace(/;/g, '');

                    const arrayPaths = JSON.parse(strPaths);
                    const arrayNames = JSON.parse(strNames);
                    const extractedValues = this.extractFields(JSON.parse(input['defaultValue']), arrayPaths, arrayNames);

                    input['type'] = 'object';
                    input['defaultValue'] = extractedValues;
                }
            }
            return input;
        });

        const outputsMap = outputParams.map((output: any) => {
            output['customClass'] = 'col-4';
            output['autocomplete'] = 'off';
            if (output.type === 'textfield') {
                this.payload[output.name] = '';
            }
            if (output.type === 'checkbox') {
                this.payload[output.dataName] = false;
            }
            return output;
        });

        const formInputResponse: FormioForm = {
            title: 'My Test Form',
            components: inputsMap,
        };

        const formOutputResponse: FormioForm = {
            title: 'My Test Form',
            components: outputsMap,
        };

        this.formInputConfig = formInputResponse;
        this.formOutputConfig = formOutputResponse;

        setTimeout(() => {
            this.loadingForm = false;
            setTimeout(() => {
                const element = document.getElementsByClassName('formio-form')[0];
                element?.classList.add('row', 'd-flex', 'align-items-center');
            }, 100);
        }, 250);
    }

    getObjectKeys(obj: any): string[] {
        return Object.keys(obj);
    }

    onBuilderChange(formComponents: any) {
        if (formComponents?.changed?.component?.name) {
            this.payload[formComponents?.changed?.component?.name] = formComponents?.changed?.value;
        }
        if (formComponents?.changed?.component?.dataName) {
            this.payload[formComponents?.changed?.component?.dataName] = formComponents?.changed?.value;
        }
        if (formComponents?.changed?.component?.type === 'radio') {
            for (let val of formComponents?.changed.component.values) {
                this.payload[val.label] = val.value === formComponents?.changed.value ? true : false;
            }
        }
        if (formComponents?.changed?.component?.type === 'select') {
            this.payload[formComponents?.changed.component.key] = formComponents?.changed.value;
        }
    }

    getOwner(instanceId: number, position?: number): Observable<{ users: string[]; groups: string[] }> {
        return new Observable((observer) => {
            let result: any;
            let asignArray: string[] = [];
            // GET Workitems to get users or group owners
            this.bpmService.getWorkItems(instanceId, this.containerId, this.processId).subscribe({
                next: (workItemResponse) => {
                    if (!isEmpty(workItemResponse['work-item-instance-list'])) {
                        if (!Array.isArray(workItemResponse['work-item-instance-list']['work-item-instance'])) {
                            const notStartedReassign = workItemResponse['work-item-instance-list']['work-item-instance']['parameters']['entry'].find(
                                (entry: any) => entry.key._text === 'NotStartedReassign'
                            );
                            if (notStartedReassign) {
                                asignArray = asignArray.concat(notStartedReassign?.value._text.split('^'));
                            }
                            const notCompletedReassign = workItemResponse['work-item-instance-list']['work-item-instance']['parameters'][
                                'entry'
                            ].find((entry: any) => entry.key._text === 'NotCompletedReassign');
                            if (notCompletedReassign) {
                                asignArray = asignArray.concat(notCompletedReassign?.value._text.split('^'));
                            }
                            result = this.extractUsersAndGroupsFromArray(asignArray);
                            this.users = result.users;
                            this.groups = result.groups;
                            const taskGroupId = workItemResponse['work-item-instance-list']['work-item-instance']['parameters']['entry'].find(
                                (entry: any) => entry.key._text === 'GroupId'
                            );
                            if (taskGroupId) {
                                this.groups.push(taskGroupId?.value._text);
                            }
                            // Emitir el resultado y completar el Observable
                            observer.next({ users: this.users, groups: this.groups });
                            this.includeOnGroups = this.groups.some((role: any) => role.includes(this.currentUser.user_role));
                            observer.complete();
                        } else {
                            const workItemInstance = workItemResponse['work-item-instance-list']['work-item-instance'][position!];
                            const notStartedReassign = workItemInstance['parameters']['entry'].find(
                                (entry: any) => entry.key._text === 'NotStartedReassign'
                            );
                            if (notStartedReassign) {
                                asignArray = asignArray.concat(notStartedReassign?.value._text.split('^'));
                            }
                            const notCompletedReassign = workItemInstance['parameters']['entry'].find(
                                (entry: any) => entry.key._text === 'NotCompletedReassign'
                            );
                            if (notCompletedReassign) {
                                asignArray = asignArray.concat(notCompletedReassign?.value._text.split('^'));
                            }
                            result = this.extractUsersAndGroupsFromArray(asignArray);
                            this.users = result.users;
                            this.groups = result.groups;
                            const taskGroupId = workItemInstance['parameters']['entry'].find((entry: any) => entry.key._text === 'GroupId');
                            if (taskGroupId) {
                                this.groups.push(taskGroupId?.value._text);
                            }
                            // Emitir el resultado y completar el Observable
                            observer.next({ users: this.users, groups: this.groups });
                            this.includeOnGroups = this.groups.some((role: any) => role.includes(this.currentUser.user_role));
                            observer.complete();
                        }
                    } else {
                        observer.next({ users: [], groups: ['all'] });
                        observer.complete();
                    }
                },
                error: (error) => {
                    console.error(error);
                },
            });
        });
    }

    isJSON(str: string): boolean {
        try {
            const parsed = JSON.parse(str);
            return typeof parsed === 'object' && parsed !== null;
        } catch (e) {
            return false;
        }
    }

    extractFields(json: any, fields: any, fieldNames: any) {
        let result: any = {};

        // Inicializamos el resultado para cada campo de interés con un array vacío
        fieldNames.forEach((fieldName: any) => {
            result[fieldName] = [];
        });

        function recursiveExtract(currentObj: any, fieldPathArray: any, currentPath = '', currentNameIndex = -1) {
            // Verificamos si el objeto actual es un array
            if (Array.isArray(currentObj)) {
                for (const item of currentObj) {
                    recursiveExtract(item, fieldPathArray, currentPath, currentNameIndex);
                }
            } else if (typeof currentObj === 'object' && currentObj !== null) {
                for (const key in currentObj) {
                    let newPath = currentPath ? `${currentPath}.${key}` : key;

                    // Si el campo actual coincide con alguno de los campos de interés
                    fieldPathArray.forEach((field: any, index: any) => {
                        if (newPath === field) {
                            let fieldName = fieldNames[index]; // Usamos la categoría correspondiente de fieldNames

                            // Verificamos si es un array, en cuyo caso guardamos la lista completa
                            if (Array.isArray(currentObj[key])) {
                                result[fieldName].push(currentObj[key]); // Guardamos el array completo
                            } else {
                                result[fieldName].push(currentObj[key]); // Si no es un array, guardamos el valor directamente
                            }
                        }
                    });

                    // Recursión sobre sub-objetos
                    recursiveExtract(currentObj[key], fieldPathArray, newPath, currentNameIndex);
                }
            }
        }

        // Función recursiva para eliminar listas que no contienen solo strings, a cualquier nivel de profundidad
        function isValidArray(arr: any) {
            return arr.every((item: any) => {
                if (Array.isArray(item)) {
                    return isValidArray(item); // Llamada recursiva para listas anidadas
                } else {
                    return typeof item === 'string' || typeof item === 'number'; // Verifica que el elemento sea string
                }
            });
        }

        function cleanResult(obj: any) {
            for (let key in obj) {
                if (Array.isArray(obj[key])) {
                    obj[key] = obj[key].filter((arr: any) => {
                        if (Array.isArray(arr)) {
                            return isValidArray(arr); // Usamos la nueva función isValidArray
                        } else {
                            return typeof arr === 'string' || typeof arr === 'number'; // En caso de listas simples
                        }
                    });
                }
            }
        }

        recursiveExtract(json, fields);
        cleanResult(result); // Limpiamos el resultado
        return result;
    }

    getMaxRowCount(obj: any): number[] {
        if (!obj) return [];
        let maxCount = Math.max(...Object.values(obj).map((arr) => (arr as any[]).length));
        return Array.from({ length: maxCount }, (_, i) => i);
    }

    getNotifications() {
        this.notificationsSbj = this.bpmService.getNotifications(this.currentUser.user_name).subscribe({
            next: (response: Notification[]) => {
                this.appService.setCurrentNotifications(sortBy(response, 'type', 'asc'));
            },
            error: (error) => {
                console.error(error);
            },
        });
    }

    updatePermit() {
        if (this.payload['Permit Title']) {
            let permitUpdate = new PermitUpdate(new Date());
            permitUpdate.description = this.payload['Permit Title'];
            if (this.metaTitleList.length > 0) {
                permitUpdate.steps = this.metaTitleList;
            }
            this.permitsService.updatePermit(this.parentInstanceId!, permitUpdate).subscribe({
                next: (response) => {},
                error: (error) => {
                    console.error(error);
                },
            });
        } else {
            let permitUpdateDate = new PermitUpdateDate(new Date());
            this.permitsService.updatePermitDate(this.parentInstanceId!, permitUpdateDate).subscribe({
                next: (response) => {},
                error: (error) => {
                    console.error(error);
                },
            });
        }
    }

    claim() {
        this.loadingForm = true;
        this.bpmService.claim(Number(this.taskInstanceId), this.containerId, this.processId).subscribe({
            next: (response) => {
                this.getTask();
            },
            error: (error) => {
                console.error(error);
                this.getTask();
            },
        });
    }

    start() {
        this.loadingForm = true;
        this.bpmService.start(Number(this.taskInstanceId), this.containerId, this.processId).subscribe({
            next: (response) => {
                this.getTask();
            },
            error: (error) => {
                console.error(error);
                this.getTask();
            },
        });
    }

    release() {
        this.loadingForm = true;
        this.bpmService.release(Number(this.taskInstanceId), this.containerId, this.processId).subscribe({
            next: (response) => {
                this.getTask();
            },
            error: (error) => {
                console.error(error);
                this.getTask();
            },
        });
    }

    stop() {
        this.loadingForm = true;
        this.bpmService.stop(Number(this.taskInstanceId), this.containerId, this.processId).subscribe({
            next: (response) => {
                this.getTask();
            },
            error: (error) => {
                console.error(error);
                this.getTask();
            },
        });
    }

    save() {
        this.loadingForm = true;
        this.bpmService.save(Number(this.taskInstanceId), this.containerId, this.processId).subscribe({
            next: (response) => {
                this.getTask();
            },
            error: (error) => {
                console.error(error);
                this.getTask();
            },
        });
    }

    complete() {
        this.loadingForm = true;
        this.bpmService.complete(Number(this.taskInstanceId), this.payload, this.containerId, this.processId).subscribe({
            next: (response) => {
                this.getTask();
            },
            error: (error) => {
                console.error(error);
                this.toastService.showErrorToast('Error', this.translateService.instant('errors.httpErrorGeneral'));
                this.getTask();
            },
        });
    }

    completeAutoProgress() {
        this.loadingForm = true;
        if (this.payload['Project Text_textarea']) this.payload['Project Text_textarea'] = encodeURIComponent(this.payload['Project Text_textarea']);
        this.bpmService.completeAutoprogress(Number(this.taskInstanceId), this.payload, this.containerId, this.processId).subscribe({
            next: (response) => {
                this.updatePermit();
                this.appService.getNotifications(this.currentUser?.user_name!);
                this.toastService.showSuccessToast('', this.translate.instant('permits.permitUpdated'));
                if (this.currentUser.user_role[0].includes('applicants') || this.currentUser.user_role[0].includes('ecologists')) {
                    this.router.navigate(['construction', this.constructionId]);
                } else {
                    this.router.navigate(['permits']);
                }
            },
            error: (error) => {
                console.error(error);
                this.toastService.showErrorToast('Error', this.translateService.instant('errors.httpErrorGeneral'));
                if (this.currentUser.user_role[0].includes('applicants') || this.currentUser.user_role[0].includes('ecologists')) {
                    this.router.navigate(['construction', this.constructionId]);
                } else {
                    this.router.navigate(['permits']);
                }
            },
        });
    }
}
