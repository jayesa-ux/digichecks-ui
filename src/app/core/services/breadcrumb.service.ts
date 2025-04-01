import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Breadcrumb } from '../model/breadcrumb/breadcrumb.model';

@Injectable({
    providedIn: 'root',
})
export class BreadcrumbService implements OnDestroy {
    private readonly _breadcrumbs$ = new BehaviorSubject<Breadcrumb[]>([]);
    readonly _breadcrumbsSize$ = new BehaviorSubject<number>(0);

    readonly breadcrumbs$ = this._breadcrumbs$.asObservable();

    breadcumbSbj: Subscription;

    constructor(private route: ActivatedRoute) {
        this.breadcumbSbj = this.route.data.subscribe((data) => {
            this.route.params.subscribe((params) => {
                const replaced = this.reemplazarParametrosBreadcrumb(data.breadcrumb, params);
                const breadcrumbs: Breadcrumb[] = replaced;
                this._breadcrumbs$.next(breadcrumbs);
                this._breadcrumbsSize$.next(breadcrumbs.length);
            });
            return;
        });
    }

    ngOnDestroy(): void {
        this.breadcumbSbj?.unsubscribe();
    }

    reemplazarParametrosBreadcrumb(breadcrumbs: any, params: any) {
        return breadcrumbs.map((item: any) => {
            let urlActualizada = item.url;
            // replace breadcrumbs url whit params
            Object.keys(params).forEach((param) => {
                const valor = params[param];
                const patron = new RegExp(`:${param}`, 'g');
                urlActualizada = urlActualizada.replace(patron, valor);
            });
            return {
                ...item,
                url: urlActualizada,
            };
        });
    }
}
