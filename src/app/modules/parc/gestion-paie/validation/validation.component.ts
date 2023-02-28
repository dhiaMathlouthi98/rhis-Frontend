import {Component, EventEmitter, Input, Output, SimpleChanges} from '@angular/core';
import {FranchiseRestaurant} from "../../../../shared/model/gui/parc.mode";
import {ValidationPaieService} from "../../../home/gdh/service/validation-paie.service";
import {ValidationPeriodPaie} from "../../../../shared/model/validationPeriodePaie";
import {DatePipe} from "@angular/common";
import {SessionService} from "../../../../shared/service/session.service";
import {RestaurantModel} from "../../../../shared/model/restaurant.model";
import {GdhVuePayeRapportDeltaNegatif} from "../../../../shared/model/gui/GdhVuePayeRapportDeltaNegatif.model";
import {GdhService} from "../../../home/gdh/service/gdh.service";
import {ParametreGlobalService} from "../../../home/configuration/service/param.global.service";
import {RhisTranslateService} from "../../../../shared/service/rhis-translate.service";
import {EnvoiService} from "../../services/envoi.service";
import {GenerateFilesService} from "../../../../shared/service/generate.files.service";
import {DateService} from "../../../../shared/service/date.service";

@Component({
    selector: 'rhis-validation',
    templateUrl: './validation.component.html',
    styleUrls: ['./validation.component.scss']
})
export class ValidationComponent {

    @Input()
    public startPeriod: string;
    @Input()
    public endPeriod: string;
    @Input()
    public restaurants: FranchiseRestaurant[];
    @Output()
    public updateValidatedRestaurants = new EventEmitter();
    @Output()
    public goToGeneratingTab = new EventEmitter<{isActive: boolean, index: number}>();
    public displayedRestaurants: FranchiseRestaurant[];
    public selectedRestaurants: FranchiseRestaurant[];
    public disableMultiSelectOption = false;
    public disableButton = false;
    public startDate: string;
    public endDate: string;
    public showPopupDeltaNegatif = false;
    public deltaNegatifPerRestaurant: Map<string, GdhVuePayeRapportDeltaNegatif> = new Map<string, GdhVuePayeRapportDeltaNegatif>();
    private readonly BLOCK_GDH_PARAM_CODE = 'GDH_BLOCK';

    constructor(private validationPaieService: ValidationPaieService,
                private validationPayService: ValidationPaieService,
                private sessionService: SessionService,
                private gdhService: GdhService,
                private parametreGlobalService: ParametreGlobalService,
                private rhisTranslateService: RhisTranslateService,
                private dateService: DateService) {
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
                    this.displayedRestaurants = restaurants.filter(restaurant => !restaurant.validated);
                    if (this.displayedRestaurants.length == 0) {
                        this.goToGeneratingTab.emit({isActive: false, index: 1});
                    } else {
                        this.goToGeneratingTab.emit({isActive: true, index: 0});
                    }
                });
            }
        }
    }

    public startValidationProcessForRestaurants(): void {
        this.deltaNegatifPerRestaurant.clear();
        this.verifyDelta(this.selectedRestaurants);
    }

    public validate(): void {
        this.closePopupDeltaNegatif();
        this.selectedRestaurants.forEach(restaurant => this.validatedPeriodAndBlockGdhAndRapportIfConfigValidation(restaurant));
    }

    public async verifyDelta(restaurants: FranchiseRestaurant[]): Promise<void> {
        const filter = {date: this.startDate, onlyManagers: true, onlyEmployees: true}
        for (const restaurant of restaurants) {
            const gdhVuePayeRapportDeltaNegatif: GdhVuePayeRapportDeltaNegatif = await await this.gdhService.checkDeltaNegatif(filter, restaurant.uuid).toPromise();
            if (gdhVuePayeRapportDeltaNegatif.listEmploye && gdhVuePayeRapportDeltaNegatif.listEmploye.length > 0) {
                this.deltaNegatifPerRestaurant.set(restaurant.libelle, gdhVuePayeRapportDeltaNegatif)
            }
        }
        if (this.deltaNegatifPerRestaurant.size > 0) {
            this.showPopupDeltaNegatif = true;
        }
    }


    private async validatedPeriodAndBlockGdhAndRapportIfConfigValidation(restaurant: FranchiseRestaurant): Promise<void> {
        const validation: ValidationPeriodPaie = {
            id: {
                startPeriod: this.startPeriod,
                endPeriod: this.endPeriod,
                restaurant: {idRestaurant: restaurant.idRestaurant} as RestaurantModel
            },
            validatorLastFirstName: this.sessionService.getUserPrenom() + ' ' + this.sessionService.getUserNom(),
            validatorUuid: this.sessionService.getUuidUser(),
            validationTime: this.dateService.formatDateTo(new Date(),'YYYY-MM-DD[T]HH:mm:ss'),
            generationTime: null,
            validated: true,
            generated: false
        };

        // on peut valider meme si y'a pas d'envoi
        await this.validationPayService.addValidationPeriodPaie(validation, true).toPromise();
        this.displayedRestaurants = this.displayedRestaurants.filter(res => res.uuid !== restaurant.uuid);
        this.selectedRestaurants = this.selectedRestaurants.filter(res => res.uuid !== restaurant.uuid);
        this.updateValidatedRestaurants.emit();
        if (this.displayedRestaurants.length == 0) {
            this.goToGeneratingTab.emit({isActive: false, index: 1});
        }
        await this.blockPeriod(restaurant.uuid);
    }

    public getHeaderDeltaNegatif(restaurantName: string, deltaNegatifPerRestaurant: Map<string, GdhVuePayeRapportDeltaNegatif>): string {
        return restaurantName + ' : ' + this.rhisTranslateService.translate('GDH.TTILE_DELTA_NEGATIF') + ' ' +
            deltaNegatifPerRestaurant.get(restaurantName).listEmploye.length + ' ' +
            this.rhisTranslateService.translate('GDH.TTILE_DELTA_NEGATIF_PART2')
    }

    public async blockPeriod(restaurantUuid: string): Promise<void> {
        const blockGdhParam = await this.parametreGlobalService.getParameterByRestaurantIdAndCodeParameter(this.BLOCK_GDH_PARAM_CODE, restaurantUuid).toPromise();
        blockGdhParam.valeur = this.endDate.split('-').join('/');
        await this.parametreGlobalService.updateParamsByRestaurant([blockGdhParam], restaurantUuid).toPromise();
    }

    public closePopupDeltaNegatif(): void {
        this.showPopupDeltaNegatif = false;
    }

}
