import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedMouleModule } from '../../../shared/shared-moule.module';
import { BreadcrumbsComponent } from '../../layout/breadcrumbs/breadcrumbs.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
    selector: 'app-document-viewer',
    standalone: true,
    imports: [SharedMouleModule, BreadcrumbsComponent, PdfViewerModule],
    templateUrl: './document-viewer.component.html',
    styleUrl: './document-viewer.component.css',
})
export class DocumentViewerComponent {
    @Input() filename: string;
    @Output() closePDFEvent = new EventEmitter<void>();
    @Output() downloadPDFEvent = new EventEmitter<void>();

    fileContent: string | null = null;
    pdfSrc: string = '';
    zoomLevelPDF: number = 1.0;
    currentPagePDF: number = 1;

    constructor(private route: ActivatedRoute) {}

    ngOnInit() {
        this.pdfSrc = this.filename;
    }

    zoomInPDF() {
        this.zoomLevelPDF += 0.1;
    }

    zoomOutPDF() {
        this.zoomLevelPDF -= 0.1;
    }

    nextPagePDF() {
        this.currentPagePDF++;
    }

    prevPagePDF() {
        if (this.currentPagePDF > 1) {
            this.currentPagePDF--;
        }
    }

    closePDF() {
        this.closePDFEvent.emit();
    }

    downloadPDF() {
        this.downloadPDFEvent.emit();
    }
}
