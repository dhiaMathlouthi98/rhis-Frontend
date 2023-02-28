import {Component, OnInit} from '@angular/core';
import {AnomalieService} from '../../../../planning/shift-impose/service/anomalie.service';
import {AnomalieModel} from '../../../../../../shared/model/anomalie.model';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';

@Component({
  selector: 'rhis-anomalies-sociales',
  templateUrl: './anomalies-sociales.component.html',
  styleUrls: ['./anomalies-sociales.component.scss']
})
export class AnomaliesSocialesComponent implements OnInit {
  public anomalies: AnomalieModel[] = [];
  public formattedAnomalies: {code: string, label: string, nbr: number, value: string, icon: string}[] = [];
  public loading = false;
  constructor(private anomalieService: AnomalieService, private rhisTranslateService: RhisTranslateService) { }

  ngOnInit() {
    this.loading = true;
    this.anomalieService.getAnomalieWeekByRestaurantAndDate().subscribe(a => {
      this.anomalies = a;
      this.anomalies.forEach(anomalie => {
        const codes = this.formattedAnomalies.map(fa => fa.code);
        if (codes.includes(anomalie.codeAnomalie)) {
          const formattedAnomalie = this.formattedAnomalies.find(fa => fa.code === anomalie.codeAnomalie);
          formattedAnomalie.value = this.getAnomalieValueSum(anomalie.valeurDepasse, formattedAnomalie.value);
          formattedAnomalie.nbr = formattedAnomalie.nbr + 1;
        } else {
          const icon = this.getAnomalieIcon(anomalie);
          const formattedAnomalie = {code: anomalie.codeAnomalie, label: anomalie.libelleAnomalie, value: anomalie.valeurDepasse, nbr: 1, icon};
          this.formattedAnomalies.push(formattedAnomalie);
        }
      });
      this.loading = false;
    }, (err: any) => {
      // TODO notify of error
      this.loading = false;
      console.log(err);
    });
  }

  private getAnomalieIcon(anomalie: AnomalieModel): string {
    let icon: string;
    switch (anomalie.codeAnomalie) {
      case 'COLLABORATEUR_TRAVAIL_JOUR_FERIE':
      case 'COLLABORATEUR_TRAVAIL_DIMANCHE':
      case 'COLLABORATEUR_TRAVAIL_WEEK_END':
        icon = '2/Ico_Employé.svg';
        break;

      case 'HEURE_REPOS_MIN_ENTRE_DEUX_JOURS':
      case 'LONGUEUR_MAXI_SHIFT_SANS_BREAK':
      case 'NB_HEURE_MAXI_JOUR_PLANIFIE':
      case 'AMPLITUDE_JOUR_MAX':
        icon = '3/Ico_Time.svg';
        break;

      case 'NB_SHIFT_MAX_JOUR':
      case 'LONGUEUR_MINI_SHIFT':
      case 'LONGUEUR_MINI_BREAK':
        icon = '1/Ico_Calendrier.svg';
        break;
    }
    return icon;
  }

  private getAnomalieValueSum(anomalieValue: string, formattedAnomalieValue: string): string {
    if (anomalieValue.includes('h')) {
      const partsAnomalie = anomalieValue.split('h', 2);
      const minutesAnomalie = (+partsAnomalie[0] * 60) + (+partsAnomalie[1]);
      const partsFormattedAnomalie = anomalieValue.split('h', 2);
      const minutesFormattedAnomalie = (+partsFormattedAnomalie[0] * 60) + (+partsFormattedAnomalie[1]);
      const sum = minutesAnomalie + minutesFormattedAnomalie;
      const h = Math.floor(sum / 60);
      const min = sum % 60;
      return h.toString().concat('h').concat(min.toString());
    } else {
      return (+anomalieValue + (+formattedAnomalieValue)).toString();
    }
  }
}
