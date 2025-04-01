import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './core/interceptors/errorInterceptor';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CookieService } from 'ngx-cookie-service';
import { AppServiceService } from './core/services/app-service.service';
import { authInterceptor } from './core/interceptors/authInterceptor';

export function HttpLoaderFactory(httpClient: HttpClient) {
    return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json?cacheBuster=' + new Date().getTime());
}

export function checkCurrentUser(cookieService: CookieService, appServiceService: AppServiceService) {
    return (): void => {
        // const cookieUser: string = cookieService.get('username');
        // const cookieUserNameComplete: string = cookieService.get('usernamecomplete');
        // const roleUser: string = cookieService.get('userrole') ? cookieService.get('userrole') : '';
        // const accesstoken: string = cookieService.get('accesstoken');
        const cookieUser: string = localStorage.getItem('username')!;
        const cookieUserNameComplete: string = localStorage.getItem('usernamecomplete')!;
        const roleUser: string = localStorage.getItem('userrole') ? localStorage.getItem('userrole')! : '';
        const usergroup: string = localStorage.getItem('usergroup')!;
        const accesstoken: string = localStorage.getItem('accesstoken')!;

        if (cookieUser) {
            appServiceService.setCurrentUser({
                user_name: cookieUser,
                user_name_complete: cookieUserNameComplete,
                user_role: roleUser.split(','),
                user_group: usergroup,
                access_token: accesstoken,
                isLogged: true,
            });
        }
    };
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideAnimations(),
        provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
        importProvidersFrom(
            TranslateModule.forRoot({
                loader: {
                    provide: TranslateLoader,
                    useFactory: HttpLoaderFactory,
                    deps: [HttpClient],
                },
            }),
            CookieService
        ),
        {
            provide: APP_INITIALIZER,
            useFactory: checkCurrentUser,
            multi: true,
            deps: [CookieService, AppServiceService],
        },
    ],
};
