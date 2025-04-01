import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppServiceService } from './app-service.service';
import { User } from '../model/user.model';
import { environment } from '../../../environments/environment';
import { isEmpty } from 'lodash';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { BPMService } from './bpm.service';
import { roleThemeMapping } from '../config/role-theme-mapping';

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    env = environment;
    constructor(
        private router: Router,
        private http: HttpClient,
        private appServiceService: AppServiceService,
        private bpmService: BPMService
    ) {}

    login(username: string, password: string) {
        const body = { username: username, password: password };
        const userEncode: string = btoa(`${body.username}:${body.password}`);
        localStorage.setItem('authorizationBPM', `Basic ${userEncode}`);
        this.bpmService.setAuthorizationUser(`Basic ${userEncode}`);
        return this.http.post<User>(`${this.env.urlBase}/auth/login`, body).subscribe((response) => {
            const decodeToken: any = jwtDecode(response.access_token);
            localStorage.setItem('username', decodeToken.preferred_username);
            localStorage.setItem('usernamecomplete', decodeToken.name);
            localStorage.setItem('userrole', decodeToken.realm_access.roles);
            localStorage.setItem('usergroup', decodeToken.groups[0]);
            localStorage.setItem('accesstoken', response.access_token);
            this.appServiceService.setCurrentUser({
                user_name: decodeToken.preferred_username,
                user_name_complete: decodeToken.name,
                user_role: decodeToken.realm_access.roles,
                user_group: decodeToken.groups[0],
                access_token: response.access_token,
                isLogged: true,
            });
            this.appServiceService.getNotifications(decodeToken.preferred_username);
            setTimeout(() => {
                this.changeTheme(decodeToken.realm_access.roles);

                if (
                    decodeToken.realm_access.roles.some((role: any) => role.includes('applicants')) ||
                    decodeToken.realm_access.roles.some((role: any) => role.includes('ecologists'))
                ) {
                    this.router.navigate(['constructions']);
                } else {
                    this.router.navigate(['permits']);
                }
            }, 10);
        });
    }

    changeTheme(roles: string[]): void {
        const theme = this.getColorForRole(roles);
        setTimeout(() => {
            const bodyElement = document.body;
            bodyElement.setAttribute('data-bs-theme', theme!);
        }, 100);
    }

    getColorForRole(roles: string[]): string | null {
        const roleThemeMappingObj = roleThemeMapping;
        for (const mapping of roleThemeMappingObj) {
            for (const [color, roleList] of Object.entries(mapping)) {
                if (roles.some((role) => roleList.includes(role))) {
                    return color;
                }
            }
        }
        return null;
    }

    checkLogin(): boolean {
        return !isEmpty(this.appServiceService.getCurrentUser()) ? true : false;
    }

    getUserName() {
        return localStorage.getItem('username');
    }
    getUserNameComplete() {
        return localStorage.getItem('usernamecomplete');
    }

    getUserRole() {
        return localStorage.getItem('userrole');
    }

    getUserGroup() {
        return localStorage.getItem('usergroup');
    }

    getAccessToken() {
        return localStorage.getItem('accesstoken');
    }

    logout() {
        localStorage.removeItem('username');
        localStorage.removeItem('usernamecomplete');
        localStorage.removeItem('userrole');
        localStorage.removeItem('usergroup');
        localStorage.removeItem('accesstoken');
        localStorage.removeItem('authorizationBPM');
        this.appServiceService.setCurrentUser({
            user_name: '',
            user_name_complete: '',
            user_role: [],
            user_group: '',
            access_token: '',
            isLogged: false,
        });
    }
}
