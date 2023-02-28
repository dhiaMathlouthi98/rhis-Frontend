import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {ParametreRapport, RapportPaieEnum} from '../../../shared/model/parametreRapport';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private object: any = {
    comparatifFile: false,
    dayDelivery: '',
    endDate: null,
    frequenceExpedition: '',
    idParamEnvoi: '',
    listRestaurantDispaly: [],
    message: '',
    objectMail: '',
    rapport: null,
    receiver: [],
    scheduledTime: null,
    startDate: null,
    typePeriodeCalcul: '',
    year: '',
    lastNameFirstNameCreateur: '',
    uuidCreateur: '',
    uuidProfil: '',
    rapportPaieEnum: [],
    decoupage : '60',
  };

  private parametreRapport$: BehaviorSubject<ParametreRapport>;

  public tabEnvoiEmailDisabled: Boolean = true;
  buttonExport: Subject<Boolean> = new Subject<Boolean>();
  export: Subject<Boolean> = new Subject<Boolean>();
  listRestaurantSelectionne$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  constructor() {
    this.parametreRapport$ = new BehaviorSubject<ParametreRapport>({...this.object});
  }



  getParametreRapportInitializer(): ParametreRapport {
    return this.object;
  }

  setParametreRapport(parametres: ParametreRapport): void {
    this.parametreRapport$.next(parametres);
  }

  getParametreRapport(): Observable<ParametreRapport> {
    return this.parametreRapport$;
  }

  initParametreRapport(): void {
    this.parametreRapport$.unsubscribe();
    this.export.unsubscribe();
    this.listRestaurantSelectionne$.unsubscribe();
    this.parametreRapport$ = new BehaviorSubject<ParametreRapport>({...this.object});
    this.export = new Subject<Boolean>();
    this.listRestaurantSelectionne$ = new BehaviorSubject<any>([]);
  }
}
