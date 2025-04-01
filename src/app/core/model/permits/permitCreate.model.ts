export class PermitCreate {
    type: string;
    description: string;
    createDate: Date;
    modifyDate: Date;
    construction: string;
    instanceId: number;

    constructor(type: string, description: string, createDate: Date, modifyDate: Date, construction: string, instanceId: number) {
        this.type = type;
        this.description = description;
        this.createDate = createDate;
        this.modifyDate = modifyDate;
        this.construction = construction;
        this.instanceId = instanceId;
    }
}
