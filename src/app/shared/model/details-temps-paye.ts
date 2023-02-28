export class DetailTempsPayeValue {
  heure?: string;
  heureIsNight?: boolean;
  valeur?: string;
  valeurEquip?: string;
  valeurEnMinute?: number;
  valeurEquipEnMinute?: number;
}

export class DetailTempsPaye {
  dateJournee: string;
  tauxMOE: DetailTempsPayeValue[];
  tauxMOEManager: DetailTempsPayeValue[];
  cA: DetailTempsPayeValue[];
  tempsPaye: DetailTempsPayeValue[];
}
export class TotalCaPerDay {
  dateVente: string;
  ca = 0;
  day: string;
}