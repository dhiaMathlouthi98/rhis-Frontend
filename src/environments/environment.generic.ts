// This file can be replaced during build by using the `fileReplacements` array.
// The list of file replacements can be found in `angular.json`.

// yarn run build --configuration=recette replaces `environment.ts` with `environment.generic.ts`.
export const environment = {
  production: true,
  hostServerEmployee: 'https://test.travail.baha.recette.myrhis.fr/employee-service',
  hostServerPlanning: 'https://test.travail.baha.recette.myrhis.fr/planning-service',
  hostServerSecurity: 'https://test.travail.baha.recette.myrhis.fr/security'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
