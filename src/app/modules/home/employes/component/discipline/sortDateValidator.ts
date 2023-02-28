import {FormGroup} from '@angular/forms';

export function SortDateValidator(formGroup: FormGroup) {
  const dates = ['dateFais', 'dateDemandeJustif', 'dateConvocation', 'dateEntretien', 'dateNotification'];
  const stateValue = {
    dateDemandeJustif: false,
    dateConvocation: false,
    dateEntretien: false,
    dateNotification: false
  };
    dates.forEach((date, i, values: string[]) => {
      if (i !== 0 && formGroup.get(date).value !== null) {
        const previousDates = values.slice(0, i);
        previousDates.forEach(previousDate => {
          const checkedDate = new Date(formGroup.get(date).value);
          const comparedToDate = formGroup.get(previousDate).value ? new Date(formGroup.get(previousDate).value ) : null;
          if (comparedToDate != null && checkedDate < comparedToDate) {
            stateValue[date] = true;
          }
        });
      }
    });
  return isOrderDatesHasErrors(stateValue) ? stateValue : null;
}

/**
 * Check if there is an error in the order of the dates
 */
function isOrderDatesHasErrors(obj: object): boolean {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (obj[key]) {
        return true;
      }
    }
  }
  return false;
}
