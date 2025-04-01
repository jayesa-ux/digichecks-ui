import { Component, Input, OnInit } from '@angular/core';
import { SharedMouleModule } from '../../../shared/shared-moule.module';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { PermitsService } from '../../../core/services/permits.service';
import { Permit } from '../../../core/model/permits/permit.model';
import { BPMService } from '../../../core/services/bpm.service';
import { PermitHistoric } from '../../../core/model/permits/permitHistory.model';

@Component({
    selector: 'app-permits-list-timeline',
    standalone: true,
    imports: [SharedMouleModule],
    templateUrl: './permits-list-timeline.component.html',
    styleUrl: './permits-list-timeline.component.css',
})
export class PermitsListTimelineComponent implements OnInit {
    @Input() constructionCode: string | null;

    currentDate: any;
    currentMonth: string;
    currentYear: number;
    currentDaysOfMonth: number[] = [];

    permits: Permit[] = [];

    // Subcriptions
    permitsSbj: Subscription;

    constructor(
        private permitsService: PermitsService,
        private bpmService: BPMService
    ) {}

    ngOnInit() {
        this.currentDate = moment();
        this.currentMonth = this.currentDate.format('MMMM');
        this.currentYear = this.currentDate.year();
        for (let i = 1; i < moment().daysInMonth() + 1; i++) {
            this.currentDaysOfMonth.push(i);
        }
        console.log('🚀 ~ PermitsListTimelineComponent ~ ngOnInit ~ this.currentDaysOfMonth:', this.currentDaysOfMonth);

        this.permitsService.getPermitsByConstruction(this.constructionCode!).subscribe({
            next: (response: Permit[]) => {
                this.permits = response.map(
                    (permit: Permit) =>
                        new Permit(
                            permit._id,
                            permit.type,
                            permit.description,
                            permit.createDate,
                            permit.modifyDate,
                            permit.construction,
                            permit.instanceId,
                            permit.steps
                        )
                );
                this.bpmService.getLog(this.permits[0].instanceId).subscribe({
                    next: (response: PermitHistoric[]) => {
                        console.log('🚀 ~ PermitsListTimelineComponent ~ this.bpmService.getLog ~ response:', response);
                    },
                    error: (error) => {
                        console.error(error);
                    },
                });
            },
            error: (error) => {
                console.error(error);
            },
        });
    }

    nextMonth() {
        console.log('next');
        this.currentDate.add(1, 'M');
        this.currentMonth = this.currentDate.format('MMMM');
        this.currentYear = this.currentDate.year();
        this.currentDaysOfMonth = [];
        console.log('🚀 ~ PermitsListTimelineComponent ~ nextMonth ~ this.currentDaysOfMonth:', this.currentDaysOfMonth);
        for (let i = 1; i < this.currentDate.daysInMonth() + 1; i++) {
            this.currentDaysOfMonth.push(i);
        }
        console.log('🚀 ~ PermitsListTimelineComponent ~ nextMonth ~ this.currentDaysOfMonth:', this.currentDaysOfMonth);
    }

    previousMonth() {
        this.currentDate.subtract(1, 'M');
        this.currentMonth = this.currentDate.format('MMMM');
        this.currentYear = this.currentDate.year();
        this.currentDaysOfMonth = [];
        console.log('🚀 ~ PermitsListTimelineComponent ~ previousMonth ~ this.currentDaysOfMonth:', this.currentDaysOfMonth);
        for (let i = 1; i < this.currentDate.daysInMonth() + 1; i++) {
            this.currentDaysOfMonth.push(i);
        }
        console.log('🚀 ~ PermitsListTimelineComponent ~ previousMonth ~ this.currentDaysOfMonth:', this.currentDaysOfMonth);
    }
}
