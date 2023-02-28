import {Injectable} from '@angular/core';
import {RhisTranslateService} from '../../../service/rhis-translate.service';
import {DateService} from '../../../service/date.service';
import * as moment from 'moment';
import {JourSemaine} from "../../../enumeration/jour.semaine";

@Injectable({
    providedIn: 'root'
})
export class PerformanceReportHelperService {
    constructor(private rhisTranslateService: RhisTranslateService,
                private dateService: DateService) {
    }

    public generateHeaderAndEcartValues(performanceValues, filter: string): [string[], number[]] {
        const header: string[] = [];
        performanceValues.caPrevisionnel
            .forEach(cap => this.getPerformanceReportHeader(
                cap.name, {
                    value: filter,
                    JOUR: 'JOUR',
                    SEMAINE: 'SEMAINE',
                    MOIS: 'MOIS'
                }, header));
        const ecart = this.getEcart(performanceValues);
        return [header, ecart];
    }

    public getPerformanceReportHeader(date: string, filter: PerformanceFilter, header: string[]): void {
        switch (filter.value) {
            case filter.JOUR:
                const isValidDate = this.dateService.isValidDateFromStringPattern(date, 'YYYY-MM-DD');
                if (isValidDate) {
                    const dateForJourFilter = this.dateService.createDateFromStringPattern(date, 'YYYY-MM-DD');
                    const formatted = this.dateService.getFormattedDate(dateForJourFilter, 'dddd D-MM', this.rhisTranslateService.currentLang);
                    header.push(formatted);
                } else {
                    header.push(date);
                }
                break;
            case filter.SEMAINE:
                header.push(date);
                break;
            case filter.MOIS:
                if (isNaN(Number(date))) {
                    header.push(date);
                } else {
                    const dateFromYear = this.dateService.createDateFromStringPattern(date, 'M');
                    const formatted = this.dateService.getFormattedDate(dateFromYear, 'MMMM', this.rhisTranslateService.currentLang);
                    header.push(formatted);
                }
        }
    }

    public getEcart(performanceValues: any): number[] {
        const ecart = [];
        if (performanceValues) {
            const prevValues = performanceValues.caPrevisionnel.map(cap => cap.value);
            const reelValues = performanceValues.caReel.map(car => car.value);
            for (let i = 0; i < prevValues.length; i++) {
                const e = reelValues[i] === 0 ? 0 : ((reelValues[i] - prevValues[i]) / reelValues[i]) * 100;
                ecart.push(e.toFixed(2));
            }
        }
        return ecart;
    }


    public getSummaryPeriodDisplay(perf: any, filter: PerformanceFilter, date: Date): string {
        switch (filter.value) {
            case filter.JOUR:
                const formattedDateDebut =  moment(perf.caPrevisionnel[0].name).format('DD-MM');
                const formattedDateFin =  moment(perf.caPrevisionnel[6].name).format('DD-MM');
                const start = this.rhisTranslateService.translate('Acceuil.DU')[0].toUpperCase() + this.rhisTranslateService.translate('Acceuil.DU').substring(1, this.rhisTranslateService.translate('Acceuil.DU').length);
                return start + ' ' + formattedDateDebut + ' ' + this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.AU') + ' ' + formattedDateFin;
            case filter.SEMAINE:
                return 'Mois de ' +  moment(date).locale(this.rhisTranslateService.currentLang).format('MMMM').toString();
            case filter.MOIS:
                return 'Année ' + moment(date).locale(this.rhisTranslateService.currentLang).format('YYYY').toString();
        }
    }

    /**
     * Calculate offset between selected date and restaurant firt day of week
     */
    public findDecalage(date: Date, premierJourDeLaSemaine: JourSemaine): number {
        const dateSelected = date;
        let decalage = 0;
        switch (premierJourDeLaSemaine) {
            case JourSemaine.LUNDI: {
                decalage = dateSelected.getDay() - (1 % 7);
                break;
            }
            case JourSemaine.MARDI: {
                decalage = dateSelected.getDay() - (2 % 7);
                break;
            }
            case JourSemaine.MERCREDI: {
                decalage = dateSelected.getDay() - (3 % 7);
                break;
            }
            case JourSemaine.JEUDI: {
                decalage = dateSelected.getDay() - (4 % 7);
                break;
            }
            case JourSemaine.VENDREDI: {
                decalage = dateSelected.getDay() - (5 % 7);
                break;
            }
            case JourSemaine.SAMEDI: {
                decalage = dateSelected.getDay() - (6 % 7);
                break;
            }
            case JourSemaine.DIMANCHE: {
                decalage = dateSelected.getDay() - (7 % 7);
                break;
            }
        }
        if (decalage < 0) {
            decalage += 7;
        }
        return decalage;
    }

}

class PerformanceFilter {
    readonly value: string;
    readonly JOUR;
    readonly SEMAINE;
    readonly MOIS;
}
