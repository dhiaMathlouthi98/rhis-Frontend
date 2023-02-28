import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'badgeStatus',
  pure: false
})
export class BadgeStatusPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (args.choosenBadgeStatus === '') {
      return value;
    } else {
      return args ? value.filter(item => item.statut === args.choosenBadgeStatus || item.statut == null) : value;
    }

  }

}
