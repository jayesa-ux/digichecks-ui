import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, Observable, throwError, timeout } from 'rxjs';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import isEmpty from 'lodash/isEmpty';

@Injectable({
    providedIn: 'root',
})
export class BPMService {
    env = environment;
    authorizationUser: string;

    private httpClient: HttpClient;

    constructor(private handler: HttpBackend) {
        this.httpClient = new HttpClient(handler);
        this.authorizationUser = localStorage.getItem('authorizationBPM')!;
    }

    setAuthorizationUser(authorizationUser: string) {
        this.authorizationUser = authorizationUser;
    }

    createNewInstance(permitType: string, containerId: string, processId: string): Observable<any> {
        const body = {
            permitType: permitType,
        };
        //Authorization apiBPM
        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: this.authorizationUser,
            }),
        };
        return this.httpClient.post<any>(`${this.env.urlBPM}/newinstance?containerId=${containerId}&processId=${processId}`, body, httpOptions);
    }

    getInstance(processInstanceId: number, containerId: string, processId: string): Observable<any> {
        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: this.authorizationUser,
            }),
        };
        return this.httpClient.get<any>(`${this.env.urlBPM}/instance?containerId=${containerId}&processInstanceId=${processInstanceId}`, httpOptions);
    }

    getInstances(containerId: string, processId: string): Observable<any> {
        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: this.authorizationUser,
            }),
        };
        return this.httpClient.get<any>(`${this.env.urlBPM}/instances?containerId=${containerId}&page=0&pageSize=100&sortOrder=false`, httpOptions);
    }

    getInstancesCompleted(containerId: string, processId: string): Observable<any> {
        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: this.authorizationUser,
            }),
        };
        return this.httpClient.get<any>(
            `${this.env.urlBPM}/instances?containerId=${containerId}&status=2&page=0&pageSize=50&sortOrder=false`,
            httpOptions
        );
    }

    claim(taskInstanceId: number, containerId: string, processId: string) {
        const httpOptions: Object = {
            headers: new HttpHeaders({
                Authorization: this.authorizationUser,
                'Content-Type': 'application/x-www-form-urlencoded',
            }),
            responseType: 'text',
        };
        return this.httpClient.get<any>(
            `${this.env.urlBPM}/taskInstance/claim?containerId=${containerId}&taskInstanceId=${taskInstanceId}`,
            httpOptions
        );
    }

    start(taskInstanceId: number, containerId: string, processId: string) {
        const httpOptions: Object = {
            headers: new HttpHeaders({
                Authorization: this.authorizationUser,
                'Content-Type': 'application/x-www-form-urlencoded',
            }),
            responseType: 'text',
        };
        return this.httpClient.get<any>(
            `${this.env.urlBPM}/taskInstance/start?containerId=${containerId}&taskInstanceId=${taskInstanceId}`,
            httpOptions
        );
    }

    release(taskInstanceId: number, containerId: string, processId: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: this.authorizationUser,
            }),
        };
        return this.httpClient.get<any>(
            `${this.env.urlBPM}/taskInstance/release?containerId=${containerId}&taskInstanceId=${taskInstanceId}`,
            httpOptions
        );
    }

    stop(taskInstanceId: number, containerId: string, processId: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: this.authorizationUser,
            }),
        };
        return this.httpClient.get<any>(
            `${this.env.urlBPM}/taskInstance/stop?containerId=${containerId}&taskInstanceId=${taskInstanceId}`,
            httpOptions
        );
    }

    save(taskInstanceId: number, containerId: string, processId: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: this.authorizationUser,
            }),
        };
        return this.httpClient.get<any>(
            `${this.env.urlBPM}/taskInstance/save?containerId=${containerId}&taskInstanceId=${taskInstanceId}`,
            httpOptions
        );
    }

    complete(taskInstanceId: number, payload: any, containerId: string, processId: string) {
        let body = new URLSearchParams();
        body.set('params', JSON.stringify(payload));
        const httpOptions: Object = {
            headers: new HttpHeaders({
                Authorization: this.authorizationUser,
                'Content-Type': 'application/x-www-form-urlencoded',
            }),
            responseType: 'text',
        };
        return this.httpClient.post<any>(
            `${this.env.urlBPM}/taskInstance/complete?containerId=${containerId}&taskInstanceId=${taskInstanceId}`,
            body.toString(),
            httpOptions
        );
    }

    completeAutoprogress(taskInstanceId: number, payload: any, containerId: string, processId: string) {
        let body = new URLSearchParams();
        body.set('params', JSON.stringify(payload));
        const httpOptions: Object = {
            headers: new HttpHeaders({
                Authorization: this.authorizationUser,
                'Content-Type': 'application/x-www-form-urlencoded',
            }),
            responseType: 'text',
        };
        return this.httpClient
            .post(
                `${this.env.urlBPM}/taskInstance/complete?containerId=${containerId}&taskInstanceId=${taskInstanceId}&auto-progress=true`,
                body.toString(),
                httpOptions
            )
            .pipe(
                timeout(600000),
                catchError((error) => {
                    console.error('Request timed out or failed', error);
                    return throwError(() => error);
                })
            );
    }

    getTaskForm(taskInstanceId: number, containerId: string, processId: string): Observable<any> {
        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: this.authorizationUser,
            }),
        };
        return this.httpClient.get<any>(`${this.env.urlBPM}/taskform?containerId=${containerId}&taskInstanceId=${taskInstanceId}`, httpOptions);
    }

    getTaskInstance(taskInstanceId: number, containerId: string, processId: string): Observable<any> {
        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: this.authorizationUser,
            }),
        };
        return this.httpClient.get<any>(`${this.env.urlBPM}/taskInstance?containerId=${containerId}&taskInstanceId=${taskInstanceId}`, httpOptions);
    }

    getWorkItems(processInstanceId: number, containerId: string, processId: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: this.authorizationUser,
            }),
        };
        return this.httpClient.get<any>(
            `${this.env.urlBPM}/instance/workitems?containerId=${containerId}&processInstanceId=${processInstanceId}`,
            httpOptions
        );
    }

    getLog(processInstanceId: number) {
        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: this.authorizationUser,
            }),
        };
        return this.httpClient.get<any>(`${this.env.urlBPM}/logs?processInstanceId=${processInstanceId}`, httpOptions);
    }

    getNotifications(userName: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: this.authorizationUser,
            }),
        };
        return this.httpClient.get<any>(`${this.env.urlBPM}/notifications?userId=${userName}`, httpOptions);
    }

    deleteNotification(notificationId: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: this.authorizationUser,
            }),
        };
        return this.httpClient.get<any>(`${this.env.urlBPM}/deleteNotification?notificationId=${notificationId}`, httpOptions);
    }

    getOwner(instanceId: number, containerId: string, processId: string, index?: number): Observable<{ users: string[]; groups: string[] }> {
        return new Observable((observer) => {
            let result: any;
            let asignArray: string[] = [];
            let users: string[] = [];
            let groups: string[] = [];

            // GET Workitems to get users or group owners
            this.getWorkItems(instanceId, containerId, processId).subscribe({
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
                            users = result.users;
                            groups = result.groups;
                            const taskGroupId = workItemResponse['work-item-instance-list']['work-item-instance']['parameters']['entry'].find(
                                (entry: any) => entry.key._text === 'GroupId'
                            );
                            if (taskGroupId) {
                                groups.push(taskGroupId?.value._text);
                            }
                            // Emitir el resultado y completar el Observable
                            observer.next({ users: users, groups: groups });
                            observer.complete();
                        } else {
                            // array of work item instance
                            const workItemInstance = workItemResponse['work-item-instance-list']['work-item-instance'][index!];
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
                            users = result.users;
                            groups = result.groups;
                            const taskGroupId = workItemInstance['parameters']['entry'].find((entry: any) => entry.key._text === 'GroupId');
                            if (taskGroupId) {
                                groups.push(taskGroupId?.value._text);
                            }
                            // Emitir el resultado y completar el Observable
                            observer.next({ users: users, groups: groups });
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
}
