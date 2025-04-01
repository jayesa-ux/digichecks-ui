import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SharedMouleModule } from '../../shared/shared-moule.module';
import { Router } from '@angular/router';
import { BreadcrumbsComponent } from '../layout/breadcrumbs/breadcrumbs.component';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { GeneralService } from '../../core/services/general.service';
import { AppServiceService } from '../../core/services/app-service.service';
import { Subscription } from 'rxjs';
import { User } from '../../core/model/user.model';
import { DocumentViewerComponent } from '../common/document-viewer/document-viewer.component';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-user-documents',
    standalone: true,
    imports: [SharedMouleModule, BreadcrumbsComponent, DocumentViewerComponent],
    templateUrl: './user-documents.component.html',
    styleUrl: './user-documents.component.css',
})
export class UserDocumentsComponent implements OnInit {
    @ViewChild('btnCloseModal') btnCloseModal: ElementRef;

    filenameSelected: string = '';
    showFiles: boolean = true;
    currentUser: User;
    documents: any[] = [];
    filteredDocuments: any = [];
    searchTerm = '';

    getFileForm: UntypedFormGroup;

    loadingModal: boolean = false;
    documentSelected: any = null;

    //Subscriptions
    appServiceSbj: Subscription;
    filesSbj: Subscription;

    env = environment;

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private generalService: GeneralService,
        private appService: AppServiceService
    ) {}

    get gff() {
        return this.getFileForm.controls;
    }

    ngOnInit() {
        this.appServiceSbj = this.appService.currentUser.subscribe((currentUser) => {
            this.currentUser = currentUser;
        });

        this.filteredDocuments = this.documents;

        this.getFileForm = this.fb.group({
            documentId: ['', [Validators.required]],
            documentUrl: ['', [Validators.required]],
        });
        this.getfiles();
    }

    // get files names and extensions array
    getfiles() {
        this.filesSbj = this.generalService.getDocumentsByRole('applicantsFCC').subscribe((response) => {
            this.documents = response;
            this.filteredDocuments = response;
        });
    }

    ngOnDestroy(): void {
        this.appServiceSbj?.unsubscribe();
        this.filesSbj?.unsubscribe();
    }

    filterDocuments() {
        this.filteredDocuments = this.documents.filter((document) => document.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }

    downloadDocument(file: any) {
        this.generalService.downloadFile(file.name + file.extension).subscribe((blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name + file.extension;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        });
    }

    // show document in pdf viewer
    showDocument(document: any) {
        this.documentSelected = document;
        this.showFiles = false;
        this.filenameSelected = '';
        setTimeout(() => {
            // this.filenameSelected = `${this.env.urlBase}/general/documents/${this.currentUser.user_role[0]}/${document.name + document.extension}`;
            this.filenameSelected = `${this.env.urlBase}/general/documents/${document.name + document.extension}`;
        }, 100);
    }

    closeModal(): void {
        this.btnCloseModal.nativeElement.click();
    }

    // submit form to dowload file on server
    submitForm(): void {
        this.loadingModal = true;
        if (this.getFileForm.valid) {
            this.generalService.getDocument(this.gff.documentId.value, this.gff.documentUrl.value).subscribe({
                next: (data: any) => {
                    setTimeout(() => {
                        this.closeModal();
                        this.loadingModal = false;
                        this.getfiles();
                    }, 5000);
                },
                error: (error) => {
                    console.error('Error fetching document:', error);
                    this.loadingModal = false;
                    this.closeModal();
                },
            });
        }
    }

    onClosePDF() {
        this.filenameSelected = '';
        this.showFiles = true;
        this.documentSelected = null;
    }

    onDownloadPDF() {
        this.downloadDocument(this.documentSelected);
    }
}
