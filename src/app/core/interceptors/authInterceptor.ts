import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AppServiceService } from '../services/app-service.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const appServiceService = inject(AppServiceService);
    const authToken = appServiceService.getCurrentUser().access_token;
    const authReq = req.clone({
        setHeaders: {
            Authorization: `Bearer ${authToken}`,
        },
    });

    return next(authReq);
};
