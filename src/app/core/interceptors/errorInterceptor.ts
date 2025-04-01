import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { TranslateService } from '@ngx-translate/core';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const toastService = inject(ToastService);
    const translateService = inject(TranslateService);
    return next(req).pipe(
        catchError((error) => {
            if ([401].includes(error.status)) {
                toastService.showErrorToast('Error', translateService.instant('errors.loginError'));
            }
            if ([404].includes(error.status)) {
                console.log('Not found');
            }
            if ([500].includes(error.status)) {
                console.log('System error found');
            }
            if ([0].includes(error.status)) {
                console.log('System error found');
                toastService.showErrorToast('Error', translateService.instant('errors.httpErrorGeneral'));
            }
            console.error(error.message);
            return throwError(() => error);
        })
    );
};
