import { Routes } from '@angular/router';
import { LoginComponent } from './modules/login/login.component';
import { CreatePermitComponent } from './modules/permits/create-permit/create-permit.component';
import { ConstructionsDetailComponent } from './modules/constructions/constructions-detail/constructions-detail.component';
import { ConstructionsListComponent } from './modules/constructions/constructions-list/constructions-list.component';
import { ConstructionsFormComponent } from './modules/constructions/constructions-form/constructions-form.component';
import { AuthGuard } from './core/guards/auth.guard';
import { PermitsListAllComponent } from './modules/permits/permits-list-all/permits-list-all.component';
import { PermitsHistoryComponent } from './modules/permits/permits-history/permits-history.component';
import { UserDocumentsComponent } from './modules/user-documents/user-documents.component';
import { DocumentViewerComponent } from './modules/common/document-viewer/document-viewer.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    {
        path: 'permits',
        canActivate: [AuthGuard],
        component: PermitsListAllComponent,
        data: {
            breadcrumb: [{ label: 'permitsList', url: '/permits' }],
        },
    },
    {
        path: 'permits/:constructionId/edit/:instanceId',
        canActivate: [AuthGuard],
        component: CreatePermitComponent,
        data: {
            breadcrumb: [
                { label: 'permitsList', url: '/permits' },
                { label: 'editPermit', url: 'permits/edit/:instanceId' },
            ],
        },
    },
    {
        path: 'permits/:constructionId/edit/:instanceId/:taskid',
        canActivate: [AuthGuard],
        component: CreatePermitComponent,
        data: {
            breadcrumb: [
                { label: 'permitsList', url: '/permits' },
                { label: 'editPermit', url: 'permits/edit/:instanceId/:taskid' },
            ],
        },
    },
    {
        path: 'constructions',
        canActivate: [AuthGuard],
        component: ConstructionsListComponent,
        data: {
            breadcrumb: [{ label: 'constructionsList', url: '/constructions' }],
        },
    },
    {
        path: 'construction/new',
        canActivate: [AuthGuard],
        component: ConstructionsFormComponent,
        data: {
            breadcrumb: [
                { label: 'constructionsList', url: '/constructions' },
                { label: 'newConstruction', url: '/construction/new' },
            ],
        },
    },
    {
        path: 'construction/:constructionId',
        component: ConstructionsDetailComponent,
        canActivate: [AuthGuard],
        data: {
            breadcrumb: [
                { label: 'constructionsList', url: '/constructions' },
                { label: 'constructionDetail', url: 'construction/:constructionId' },
            ],
        },
    },
    {
        path: 'construction/:constructionId/permit/edit/:instanceId',
        canActivate: [AuthGuard],
        component: CreatePermitComponent,
        data: {
            breadcrumb: [
                { label: 'constructionsList', url: '/constructions' },
                { label: 'constructionDetail', url: '/construction/:constructionId' },
                { label: 'editPermit', url: 'construction/:constructionId/permit/edit/:instanceId' },
            ],
        },
    },
    {
        path: 'construction/:constructionId/permit/edit/:instanceId/:taskid',
        canActivate: [AuthGuard],
        component: CreatePermitComponent,
        data: {
            breadcrumb: [
                { label: 'constructionsList', url: '/constructions' },
                { label: 'constructionDetail', url: '/construction/:constructionId' },
                { label: 'editPermit', url: 'construction/:constructionId/permit/edit/:instanceId/:taskid' },
            ],
        },
    },
    {
        path: 'permit/edit/:instanceId',
        canActivate: [AuthGuard],
        component: CreatePermitComponent,
        data: {
            breadcrumb: [
                { label: 'permits', url: '/permits' },
                { label: 'editPermit', url: '/permits/permit/edit' },
            ],
        },
    },
    {
        path: 'permit/edit/:parentId/:instanceId',
        canActivate: [AuthGuard],
        component: CreatePermitComponent,
        data: {
            breadcrumb: [
                { label: 'permits', url: '/permits' },
                { label: 'editPermit', url: '/permits/permit/edit' },
            ],
        },
    },
    {
        path: 'construction/:constructionId/permit/history/:processInstanceId',
        canActivate: [AuthGuard],
        component: PermitsHistoryComponent,
        data: {
            breadcrumb: [
                { label: 'constructionsList', url: '/constructions' },
                { label: 'constructionDetail', url: '/construction/:constructionId' },
                { label: 'permitHistory', url: 'construction/:constructionId/permit/:processInstanceId' },
            ],
        },
    },
    {
        path: 'permits/permit/history/:processInstanceId',
        canActivate: [AuthGuard],
        component: PermitsHistoryComponent,
        data: {
            breadcrumb: [
                { label: 'permitsList', url: '/permits' },
                { label: 'permitHistory', url: 'permits/permit/history/:processInstanceId' },
            ],
        },
    },
    {
        path: 'documents',
        canActivate: [AuthGuard],
        component: UserDocumentsComponent,
        data: {
            breadcrumb: [{ label: 'documents', url: '/documents' }],
        },
    },
    {
        path: 'documents/:documentname',
        canActivate: [AuthGuard],
        component: DocumentViewerComponent,
        data: {
            breadcrumb: [
                { label: 'documents', url: '/documents' },
                { label: 'documentsview', url: 'documents/:documentname' },
            ],
        },
    },
];
