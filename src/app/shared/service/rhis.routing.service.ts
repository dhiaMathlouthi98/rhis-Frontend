import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RhisRoutingService {

  ALL_ROUTES = {
    'HOME': '/home',
    'ALL_SOCIETE': '/admin/societe/all',
    'HOME_SOCIETE': '/admin/societe',
    'NEW_COMPANY': '/admin/societe/new-company',
    'ALL_FRANCHISE': '/admin/franchise/all',
    'HOME_FRANCHISE': '/admin/franchise',
    // restaurants
    'ALL_TYPES_RESTAURANTS': '/admin/societe/types-restaurants',
    'TYPE_RESTAURANT': '/admin/societe/type-restaurant',
    'NEW_RESTAURANT': '/admin/societe/new-restaurant',
    'ALL_RESTAURANT': '/admin/societe/restaurants',
    'RESTAURANT_DETAIL': 'home/societe/restaurants',
    // planning
    'HOME_PLANNING': '/home/planning',
    'HOME_PLANNING_EQUIPIER': '/home/planning/planning-equipier',
    'PLANNING-MANAGER': '/home/planning/planning-manager',
    'PLANNING-MANAGER-VUE_POSTE': '/home/planning/planning-manager/vuePoste',
    'PLANNING-LEADER': '/home/planning/planning-leader',
    'PLANNING-LEADER-VUE_POSTE': '/home/planning/planning-leader/vuePoste',
    'PLANNING-SHIFT-FIXE': '/home/planning/plannings-fixes',
    'BESOIN-IMPOSE': '/home/planning/besoin-impose',
    'PLANNING-EQUIPIER': '/home/planning/planning-equipier',
    // charte
    'HOME_PREVISION': '/home/previsions',
    'CHARTE_POSITIONNEMENT': '/home/previsions/charte-positionnement',
    // Employee
    'HOME_EMPLOYEE': '/home/employee',
    'EMPLOYEE_ADD': '/home/employee/add',
    'EMPLOYEE_DETAIL': '/home/employee',
    // GDH
    'HOME_GDH': '/home/gdh',
    // Rapports
    'HOME_RAPPORT': '/home/rapports',
    'PARC_RAPPORT': '/parc/list-rapport',
    'PARC_HOME': '/parc/List/restaurantList',
    'PARC_PAIE': '/parc/gestion-paie',
    // Configuration
    'CONFIGURATION_GROUPE_TRVAIL': '/home/configuration/group-travail',
    'CONFIGURATION_POSTE_TRVAIL': '/home/configuration/poste-travail',
    'CONFIGURATION_BADGE': '/home/configuration/badge',
    'CONFIGURATION_ALERTE': '/home/gestion-alerte',
    'CONFIGURATION_ALERTE_PARC': '/parc/gestion-alerte',
    'CONFIGURATION_TYPE_CONTRAT': '/home/configuration/type-contrat',
    'CONFIGURATION_LIST_FORMATION': '/home/configuration/list-formation',
    'CONFIGURATION_JOURS_FERIES': '/home/configuration/jours-feries',
    'CONFIGURATION_TYPE_EVENEMENT': '/home/configuration/type-evenement',
    'CONFIGURATION_TYPE_SANCTION': '/home/configuration/type-sanction',
    'CONFIGURATION_PERIODE_PAIE': '/home/configuration/periode-paie',
    'CONFIGURATION_PERIODICITE': '/home/configuration/periodicite',
    'CONFIGURATION_TYPE_POINTAGE': '/home/configuration/type-pointage',
    'CONFIGURATION_PROCEDURE': '/home/configuration/procedure',
    'CONFIGURATION_MOTIF_SORTIE': '/home/configuration/motif-sortie',
    'CONFIGURATION_MOYEN_TRANSPORT': '/home/configuration/moyen-transport',
    'CONFIGURATION_PERIODE_MANAGER': '/home/restaurant/periode-manager',
    'CONFIGURATION_PARAM_RESTAURANT': '/home/configuration/param-restaurant',
    // loi restaurant
    'CONFIGURATION_LOI_RESTAURANT': '/home/restaurant/loi-restaurant',
    'PARC_CONFIGURATION_LOI_RESTAURANT': '/parc/loi-restaurant',
    // end loi restaurant
    'CONFIGURATION_LOI_PAYS': '/home/restaurant/loi-pays',
    'CONFIGURATION_EDIT_COMPANY': '/home/societe/edit-company',
    'CONFIGURATION_NATIONALITE': '/home/configuration/nationalite',
    'CONFIGURATION_MODE_VENTE': '/home/configuration/mode-vente',
    'HOME_PLANNING_CONFIGURATION_DECOUPAGE_HORAIRE': '/home/planning/configuration/gestion-decoupage-horaire',
    'HOME_PLANNING_CONFIGURATION_PARAMETRE_PLANNING': '/home/planning/configuration/parametre-planning',
    'PARAMETRE_RESTAURANT': '/parc/restaurant/params',
    'PARAMETRE_PLANNING': '/home/parametre-planning',
    'PARAMETRE_PLANNING_PARC': '/parc/parametre-planning',
    'RAPPORT_RH': '/parc/rapport',
    'PARAMETRE_VALIDATION_PAIE': '/parc/parametre-validation-paie'
  };


  public getRoute(componentName: string): string {
    return this.ALL_ROUTES[componentName];
  }

  public getAddRestaurantForSpecificSocieteRoute(componentName: string, uuidSociete: string, uuidFranchise: string) {
    if (uuidFranchise) {
      return `${this.ALL_ROUTES[componentName]}/${uuidFranchise + ' fra'}/add-restaurant`;
    } else {
      return `${this.ALL_ROUTES[componentName]}/${uuidSociete}/add-restaurant`;
    }
  }

  public getRouteDetailRestaurant(componentName: string, uuidRestaurant: string): string {
    return this.ALL_ROUTES[componentName] + '/' + uuidRestaurant;
  }

  public getRouteDetailEmployee(componentName: string, uuidEmployee: string): string {
    return this.ALL_ROUTES[componentName] + '/' + uuidEmployee + '/detail';
  }

  public getRouteDetailCongeAndAbsenceEmployee(componentName: string, uuidEmployee: string): string {
    return this.ALL_ROUTES[componentName] + '/' + uuidEmployee + '/detail/absence-conge';
  }

  public getRouteAllRestaurantByIdSociete(componentName: string, uuidSociete: string): string {
    return this.ALL_ROUTES[componentName] + '/' + uuidSociete + '/restaurants/all';
  }

  public getRouteAllRestaurantByFranchiseUuid(componentName: string, uuidFranchise: string): string {
    return this.ALL_ROUTES[componentName] + '/' + uuidFranchise + '/restaurantsFranchise/all';
  }

// route qualification employee
  public getRouteDetailQualificationEmployee(componentName: string, uuidEmployee: string): string {
    return this.ALL_ROUTES[componentName] + '/' + uuidEmployee + '/detail/qualification';
  }

// route contrat employee
  public getRouteDetailContratEmployee(componentName: string, uuidEmployee: string): string {
    return this.ALL_ROUTES[componentName] + '/' + uuidEmployee + '/detail/contrat';
  }

  public getRouteHomePac(componentName: string, uuidFranchise: string): string {
    return this.ALL_ROUTES[componentName] + '/' + uuidFranchise;
  }

  public getRouteGestionPaiParc(componentName: string): string {
    return this.ALL_ROUTES[componentName];
  }
}
