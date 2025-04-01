import { Component, OnInit } from '@angular/core';
import { SharedMouleModule } from '../../../shared/shared-moule.module';
import { TimelineComponent } from '../../common/timeline/timeline.component';
import { BPMService } from '../../../core/services/bpm.service';
import { PermitHistoric } from '../../../core/model/permits/permitHistory.model';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbsComponent } from '../../layout/breadcrumbs/breadcrumbs.component';

@Component({
    selector: 'app-permits-history',
    standalone: true,
    imports: [SharedMouleModule, TimelineComponent, BreadcrumbsComponent],
    templateUrl: './permits-history.component.html',
    styleUrl: './permits-history.component.css',
})
export class PermitsHistoryComponent implements OnInit {
    processInstanceId: string | null;
    steps!: PermitHistoric[];
    loading: boolean;

    constructor(
        private route: ActivatedRoute,
        private bpmService: BPMService
    ) {}

    ngOnInit() {
        this.processInstanceId = this.route.snapshot.paramMap.get('processInstanceId');
        this.loading = true;
        this.bpmService.getLog(Number(this.processInstanceId)).subscribe({
            next: (response: PermitHistoric[]) => {
                this.steps = response;
                this.loading = false;
            },
            error: (error) => {
                console.error(error);
            },
        });
    }
}
