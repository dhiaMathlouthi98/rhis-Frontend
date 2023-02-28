import {ItemConfigDto} from './item-config-dto.model';

export interface DpaeStatut {
    statut: DPAEStateEnum;
    errroList: string[];
    dpaeFieldsStateDto: DPAEFieldsStateDto;
}

export interface DPAEFieldsStateDto {
    allRequiredFieldsPresent?: boolean;
    fields: ItemConfigDto<number, string, string>[];
}

export enum DPAEStateEnum {
    DISABLED = 'DISABLED',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    NOT_YET_WITH_MISSED_INFOS = 'NOT_YET_WITH_MISSED_INFOS',
    NOT_YET_WITH_COMPLETE_INFOS = 'NOT_YET_WITH_COMPLETE_INFOS'
}
