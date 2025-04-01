import { Component, Input, OnInit } from '@angular/core';
import { SharedMouleModule } from '../../../shared/shared-moule.module';

export interface Step {
    name: string;
    status: string;
}

@Component({
    selector: 'app-timeline',
    standalone: true,
    imports: [SharedMouleModule],
    templateUrl: './timeline.component.html',
    styleUrl: './timeline.component.css',
})
export class TimelineComponent implements OnInit {
    @Input() stepActual: string;
    @Input() stepsList: string[];

    steps: Step[];

    constructor() {}

    ngOnInit() {
        this.steps = this.stepsList.map((step) => {
            return { name: step, status: 'NOTSTARTED' };
        });
        setTimeout(() => {
            for (const step of this.steps) {
                step.status = 'COMPLETED';
                if (step.name.toLocaleLowerCase() === this.stepActual.toLocaleLowerCase()) {
                    step.status = 'INPROGRESS';
                    break;
                }
            }
        }, 0);
    }
}
