export class Permit {
    _id: string;
    type: string;
    description: string;
    createDate: Date;
    modifyDate: Date;
    construction: string;
    instanceId: number;
    steps: string[];

    constructor(
        _id: string,
        type: string,
        description: string,
        createDate: Date,
        modifyDate: Date,
        construction: string,
        instanceId: number,
        steps: string[]
    ) {
        this._id = _id;
        this.type = type;
        this.description = description;
        this.createDate = createDate;
        this.modifyDate = modifyDate;
        this.construction = construction;
        this.instanceId = instanceId;
        this.steps = steps;
    }
}
