export interface ConstructionType {
    _id: string;
    type: string;
    name: string;
    description: string;
    permitTypes: string[];
    bpmConfig: bpmConfig;
}

export interface bpmConfig {
    containerId: string;
    processId: string;
}
