import {EntityUuidModel} from './entityUuid.model';

export class VariableReportModel extends EntityUuidModel {
    code: string;
    label: string;
    categories: string;
    variableRapportId: number;
}
