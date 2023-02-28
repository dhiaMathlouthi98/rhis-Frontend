import {Injectable} from '@angular/core';
import {SessionService} from './session.service';

@Injectable({
  providedIn: 'root'
})
export class PathService {
  private _restaurantId;
  private _defaultRestaurantId;

  private _production;

  private _hostServerEmployee;
  private _hostServerPlanning;
  private _hostServerSecurity;
  private _hostServerGDH;
  private _idleTime;
  private _hostServerCalculePlanning;
  private _hostServerRapport;

  constructor(private sessionService: SessionService) {

  }

  get defaultRestaurantId() {
    return this._defaultRestaurantId;
  }

  set defaultRestaurantId(value) {
    this._defaultRestaurantId = value;
  }


  get idleTime() {
    return this._idleTime;
  }

  set idleTime(value) {
    this._idleTime = value;
  }

  get restaurantId() {
    return this._restaurantId;
  }

  set restaurantId(value) {
    this._restaurantId = value;
  }

  get hostServerGDH() {
    return this._hostServerGDH;
  }

  set hostServerGDH(value) {
    this._hostServerGDH = value;
  }

  get production() {
    return this._production;
  }

  set production(value) {
    this._production = value;
  }

  get hostServerEmployee() {
    return this._hostServerEmployee;
  }

  set hostServerEmployee(value) {
    this._hostServerEmployee = value;
  }

  get hostServerPlanning() {
    return this._hostServerPlanning;
  }

  get hostServerRapport() {
    return this._hostServerRapport;
  }

  set hostServerRapport(value) {
    this._hostServerRapport = value;
  }
  set hostServerPlanning(value) {
    this._hostServerPlanning = value;
  }

  get hostServerSecurity() {
    return this._hostServerSecurity;
  }

  set hostServerSecurity(value) {
    this._hostServerSecurity = value;
  }

  public getIdRestaurant() {
    return this.getRestaurantID();
  }

  public getUuidRestaurant() {
    return this.sessionService.getUuidRestaurant();
  }

  public setUuidRestaurant(uuidRestaurant: string) {
    this.sessionService.setUuidRestaurant(uuidRestaurant);
  }


  // to get server path employee
  public getPathEmployee() {
    return this._hostServerEmployee;
  }

  // to get server path planning
  public getPathPlanning() {
    return this._hostServerPlanning;
  }

  public setIdRestaurant(idRestaurant) {
    this.sessionService.setRestaurant(idRestaurant);
  }

  public getRestaurantID() {
    return this.sessionService.getRestaurant();
  }

  public getPathSecurity() {
    return this._hostServerSecurity;
  }

  public getPathGdh() {
    return this._hostServerGDH;
  }
  public getPathCalculePlanning() {
    return this._hostServerCalculePlanning;
  }

  get hostServerCalculePlanning() {
    return this._hostServerCalculePlanning;
  }

  set hostServerCalculePlanning(value) {
    this._hostServerCalculePlanning = value;
  }

}
