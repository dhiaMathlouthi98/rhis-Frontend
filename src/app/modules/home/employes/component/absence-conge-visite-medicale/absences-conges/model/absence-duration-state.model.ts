import {AbsenceCongeModel} from '../../../../../../../shared/model/absence.conge.model';

export interface AbsenceDurationStateModel {
    absence: AbsenceCongeModel;
    readonly mode: DurationModeEnum;
    readonly hours?: number;
    readonly minutes?: number;
}

export enum DurationModeEnum {
    MANUAL,
    PLANNING_REPARTITION
}
