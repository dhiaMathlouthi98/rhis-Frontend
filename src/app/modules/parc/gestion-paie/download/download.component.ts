import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {RapportPaieEnum} from "../../../../shared/model/parametreRapport";
import {RhisTranslateService} from "../../../../shared/service/rhis-translate.service";
import {FranchiseRestaurant, RapportsPaieRestaurants} from "../../../../shared/model/gui/parc.mode";
import {ValidationPaieService} from "../../../home/gdh/service/validation-paie.service";
import {NotificationService} from "../../../../shared/service/notification.service";
import * as FileSaver from "file-saver";
import {GenerateFilesService} from "../../../../shared/service/generate.files.service";
import {GdhService} from "../../../home/gdh/service/gdh.service";
import {ParametreGlobalService} from "../../../home/configuration/service/param.global.service";
import {DateService} from "../../../../shared/service/date.service";
import {EnvoiService} from "../../services/envoi.service";

@Component({
    selector: 'rhis-download',
    templateUrl: './download.component.html',
    styleUrls: ['./download.component.scss']
})
export class DownloadComponent implements OnChanges, AfterViewInit {
    @Input()
    public startPeriod: string;
    @Input()
    public endPeriod: string;
    @Input()
    public restaurants: FranchiseRestaurant[];
    public selectedRestaurants: FranchiseRestaurant[];
    public validatedRestaurants: FranchiseRestaurant[];
    public nonValidatedRestaurants: FranchiseRestaurant[];
    private startDate: string;
    private endDate: string;
    private currentLangue: string;
    public displayedRestaurants: FranchiseRestaurant[];
    public isAllRestaurantSelected = false;
    public reportList = [
        {
            name: this.rhisTranslateService.translate('GDH.PAY.WEEK_VIEW_REPORT'),
            code: RapportPaieEnum.GDH_WEEK_VIEW,
            value: false
        },
        {
            name: this.rhisTranslateService.translate('GDH.PAY.PERIOD_VIEW_REPORT'),
            code: RapportPaieEnum.GDH_PERIOD_VIEW,
            value: false
        },
        {
            name: this.rhisTranslateService.translate('GDH.PAY.PAY_INTEGRATION_REPORT'),
            code: RapportPaieEnum.PAYROLL_INTEGRATION,
            value: false
        },
        {
            name: this.rhisTranslateService.translate('GDH.PAY.ACTIF_EMPLOYEES_REPORT'),
            code: RapportPaieEnum.ACTIF_EMPLOYEES_LIST,
            value: false
        }
    ];

    constructor(private rhisTranslateService: RhisTranslateService,
                private validationPaieService: ValidationPaieService,
                private notificationService: NotificationService,
                private generateFilesService: GenerateFilesService,
                private parametreGlobalService: ParametreGlobalService,
                private envoiService: EnvoiService,
                private gdhService: GdhService,
                private dateService: DateService) {
        this.currentLangue = this.rhisTranslateService.currentLang;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.restaurants) {
            let restaurants: FranchiseRestaurant[] = changes.restaurants.currentValue;
            if (restaurants && restaurants.length && this.startPeriod && this.endPeriod) {
                this.startDate = this.startPeriod.split('-').reverse().join('-');
                this.endDate = this.endPeriod.split('-').reverse().join('-');
                const ids = this.restaurants.map(restaurant => restaurant.idRestaurant);
                this.validationPaieService.getValidatedRestaurants(this.startDate, this.endDate, ids).subscribe((validations) => {
                    restaurants.forEach(restaurant => {
                        const index = validations.findIndex((validation) => validation.id.restaurant.idRestaurant === restaurant.idRestaurant);
                        restaurant.validated = index !== -1;
                    });
                    this.validatedRestaurants = restaurants.filter(restaurant => restaurant.validated);
                    this.nonValidatedRestaurants = restaurants.filter(restaurant => !restaurant.validated);
                    this.displayedRestaurants = [];
                    if (this.validatedRestaurants.length) {
                        this.validatedRestaurants = [{
                            idRestaurant: -1,
                            libelle: this.rhisTranslateService.translate("GESTION_PAIE_PARC.VALIDATE_RESTAURANTS_PAIE")
                        }].concat(this.validatedRestaurants);
                        this.displayedRestaurants = this.displayedRestaurants.concat(this.validatedRestaurants);
                    }
                    if (this.nonValidatedRestaurants.length) {
                        this.nonValidatedRestaurants = [{
                            idRestaurant: -2,
                            libelle: this.rhisTranslateService.translate("GESTION_PAIE_PARC.NON_VALIDATED_RESTAURANT_PAIE")
                        }].concat(this.nonValidatedRestaurants);
                        this.displayedRestaurants = this.displayedRestaurants.concat(this.nonValidatedRestaurants);
                    }
                })

            }
        }
    }

    ngAfterViewInit(): void {
        this.removeToolTipInMultiSelection();
    }

    public setSelectedRestaurants($event): void {
        if ($event.itemValue) {
            let idRestaurant = $event.itemValue.idRestaurant;
            if (idRestaurant == -1) {
                if (this.checkExistInById($event.value, -1)) {
                    this.selectedRestaurants = this.addAllTo(this.validatedRestaurants, this.selectedRestaurants);
                } else {
                    this.selectedRestaurants = this.removeListFrom(this.validatedRestaurants, this.selectedRestaurants);
                    this.isAllRestaurantSelected = false;
                }
            } else if (idRestaurant == -2) {
                if (this.checkExistInById($event.value, -2)) {
                    this.selectedRestaurants = this.addAllTo(this.nonValidatedRestaurants, this.selectedRestaurants);
                } else {
                    this.selectedRestaurants = this.removeListFrom(this.nonValidatedRestaurants, this.selectedRestaurants);
                    this.isAllRestaurantSelected = false;
                }
            } else {
                const isSelectedRestaurantValidated = this.checkExistInById(this.validatedRestaurants, idRestaurant);
                if (isSelectedRestaurantValidated) {
                    if (this.checkExistInById($event.value, idRestaurant)) {
                        this.selectedRestaurants = this.addAllIfLastOne(this.validatedRestaurants, this.selectedRestaurants, idRestaurant, -1)
                    } else {
                        this.selectedRestaurants = this.selectedRestaurants.filter(restaurant => restaurant.idRestaurant !== -1);
                        this.isAllRestaurantSelected = false;
                    }
                } else {
                    if (this.checkExistInById($event.value, idRestaurant)) {
                        this.selectedRestaurants = this.addAllIfLastOne(this.nonValidatedRestaurants, this.selectedRestaurants, idRestaurant, -2)
                    } else {
                        this.selectedRestaurants = this.selectedRestaurants.filter(restaurant => restaurant.idRestaurant !== -2);
                        this.isAllRestaurantSelected = false;
                    }
                }
            }
        }
        if (this.selectedRestaurants.length == this.restaurants.length + 2) {
            this.isAllRestaurantSelected = true;
        }
        this.removeToolTipInMultiSelection();
    }

    public checkOption(id: number): boolean {
        return [-1, -2].includes(id);
    }

    public getSelectedOptions(options: FranchiseRestaurant[], translator: RhisTranslateService): string {
        if ((options == null) || (options.length == 0)) {
            return translator.translate('GESTION_PARC_RAPPORT.CHOOSE');
        } else {
            const validatedOptions = options.filter(option => ![-1, -2].includes(option.idRestaurant));
            if (validatedOptions.length < 4) {
                const listRestaurantsAsPhrase = validatedOptions.map(option => option.libelle).reduce((phrase, libelle) => phrase + ', ' + libelle, '');
                return listRestaurantsAsPhrase.substr(1, listRestaurantsAsPhrase.length - 1)
            } else {
                return validatedOptions.length + ' ' + translator.translate('GESTION_PARC_RAPPORT.SELECTED_RESTAURANTS');
            }
        }
    }

    private checkExistInById(restaurants: FranchiseRestaurant[], id: number): boolean {
        return restaurants.filter(item => item.idRestaurant == id).length > 0;
    }

    private removeListFrom(restaurantsToBeRemoved: FranchiseRestaurant[], restaurants: FranchiseRestaurant[]): FranchiseRestaurant[] {
        const restaurantsIdsToBeRemoved = restaurantsToBeRemoved.map(restaurant => restaurant.idRestaurant);
        return restaurants.filter(restaurant => !restaurantsIdsToBeRemoved.includes(restaurant.idRestaurant));
    }

    private addAllTo(restaurantsWantedToAdd: FranchiseRestaurant[], restaurants: FranchiseRestaurant[]): FranchiseRestaurant[] {
        const allRestaurantsIds = restaurants.map(restaurant => restaurant.idRestaurant);
        return restaurants.concat(restaurantsWantedToAdd.filter(restaurant => !allRestaurantsIds.includes(restaurant.idRestaurant)));
    }

    private addAllIfLastOne(toBeAllAdded: FranchiseRestaurant[], restaurants: FranchiseRestaurant[], idRestaurant: number, titleId: number): FranchiseRestaurant[] {
        const title: FranchiseRestaurant = toBeAllAdded.find(restaurant => restaurant.idRestaurant == titleId);
        const isItLastOne: boolean = toBeAllAdded.filter(restaurant => ![titleId, idRestaurant].includes(restaurant.idRestaurant)).every(
            restaurant => restaurants.filter(r => r.idRestaurant === restaurant.idRestaurant).length > 0
        );
        if (isItLastOne) {
            restaurants.push(title);
        }
        return restaurants;
    }

    public downloadFiles(): void {
        const reportsCode = this.reportList.filter(report => report.value).map(report => report.code);
        const selectedRestaurants = this.selectedRestaurants ? this.selectedRestaurants.filter(restaurant => ![-1, -2].includes(restaurant.idRestaurant)) : [];
        if (reportsCode.length > 0 && selectedRestaurants.length > 0) {
            this.downloadChosenReports(reportsCode, selectedRestaurants)
        }
    }

    public canDownload(reports: {code: string, name: string, value: boolean}[], restaurants: FranchiseRestaurant[]): boolean {
        const reportsCode = reports.filter(report => report.value);
        const selectedRestaurants = restaurants ? restaurants.filter(restaurant => ![-1, -2].includes(restaurant.idRestaurant)) : [];
        return reportsCode.length > 0 && selectedRestaurants.length > 0;
    }

    private async downloadChosenReports(codes: RapportPaieEnum[], restaurants: FranchiseRestaurant[]): Promise<void> {
        this.notificationService.startLoader();
        const config: RapportsPaieRestaurants = {
            restaurants,
            codes,
            language: this.currentLangue,
            endDate: this.endDate,
            startDate: this.startDate,
            employeeReportFilter: this.generateFilesService.getFieldsToPrint(false)
        };
        const reportsNames: string[] = await this.envoiService.downloadRestaurantPaieReportsForPeriod(config).toPromise();
        try {
            await this.downloadFilesValidation(reportsNames);
            this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('GESTION_PAIE_PARC.DOWNLOAD_SUCCESS_MESSAGE'), '')
        } catch (e) {
            this.notificationService.showErrorMessage(this.rhisTranslateService.translate('GESTION_PAIE_PARC.DOWNLOAD_ERROR_MESSAGE'), '')
        } finally {
            this.notificationService.stopLoader();
        }
    }

    private async getContent(fileName: string): Promise<Blob> {
        return (await this.generateFilesService.getFileByFileNameFromGDHService(fileName).toPromise());
    }

    private async downloadFilesValidation(reportsNames: string[]): Promise<void> {
        for (let i = 0; i < reportsNames.length; i++){
            let name = reportsNames[i];
            if (name !== '' && name != null) {
                const content: Blob = await this.getContent(name);
                name = name.split('%20').join(' ');
                FileSaver.saveAs(content, name);
            }
        }
    }

    private async removeToolTipInMultiSelection(): Promise<void> {
        await this.dateService.delay(1000);
        const item = document.getElementById('choice-header');
        if (item) {
            item.parentElement.parentElement.removeAttribute('title');
        }
    }
}
