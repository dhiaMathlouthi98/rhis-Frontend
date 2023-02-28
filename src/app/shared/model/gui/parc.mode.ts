import {RapportPaieEnum} from "../parametreRapport";

export class FranchiseRestaurant {
    idRestaurant: number;
    libelle: string;
    uuid?: string;
    dateValidation?: Date;
    validated?: boolean;
}

export class PaieFileConfig {
    libelleRestaurant: string;
    content: Blob;
    fileName: string;
}

export class RapportsPaieRestaurants {
    restaurants?: FranchiseRestaurant[];
    codes?: RapportPaieEnum[];
    startDate?: string;
    endDate?: string;
    language?: string;
    employeeReportFilter: any;
}

export class EnvoiMailForRestaurants {
    rapportsPaieRestaurants: RapportsPaieRestaurants;
    mailConfig: MailConfig;
}

export class MailConfig {
    recievers: string[];
    objet: string;
    message: string;
}
