import {PositionTravailModel} from '../position.travail.model';

export interface DecoupagePlanningEquipier {
    start: { value: string, night: boolean };
    end: { value: string, night: boolean };
    date: Date;
}

export enum DiffBesoinChartColorEnum {
    RED = '#ED1C24',
    PINK = '#F14E56',
    ORANGE = '#ff9b42',
    YELLOW = '#FFC90E',
    GREEN = '#2dc76d',
    TRANSPARENT = 'rgba(0,0,0,0)'
}

export interface WorkingPositionNbr {
    position: PositionTravailModel;
    nbr: number;
}
