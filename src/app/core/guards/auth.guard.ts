import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Injectable({
    providedIn: 'root',
})
class PermissionsService {
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService
    ) {}

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (this.authenticationService.checkLogin()) {
            return true;
        } else {
            this.router.navigate(['login']);
            return false;
        }
    }
}

export const AuthGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
    return inject(PermissionsService).canActivate(next, state);
};
