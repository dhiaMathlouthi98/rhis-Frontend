import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'centiemeSuppCompHours'
})
export class CentiemeSuppCompHoursPipe implements PipeTransform {

  transform(data: any[]): string {
    const res: string[] = [];
    if (data) {
      for (let i = 0; i < data.length; i++) {
        let hours: number;
        if (data[i].value) {
          hours = Math.floor(data[i].value / 60);
          hours = Number((hours).toFixed(0));
          const time = hours.toString().padStart(2, '0') + ',' +
            (Math.round(((data[i].value - hours * 60) * 100) / 60)).toString().padStart(2, '0');
          res.push('<span>' + data[i].name + '</span> : ' + time);
        }
      }
      if (res.length) {
        return res.join('<br/>');
      } else {
        return '-';
      }
    } else {
      return '-';
    }

  }
}
