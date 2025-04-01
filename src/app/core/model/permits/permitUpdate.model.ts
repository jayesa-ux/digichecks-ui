export class PermitUpdate {
    description?: string;
    modifyDate: Date;
    steps?: string[];

    constructor(modifyDate: Date, description?: string, steps?: string[]) {
        this.description = description;
        this.modifyDate = modifyDate;
        this.steps = steps;
    }
}
