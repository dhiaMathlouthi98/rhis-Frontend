import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';

@Component({
  selector: 'rhis-poste-travail-report',
  templateUrl: './poste-travail-report.component.html',
  styleUrls: ['./poste-travail-report.component.scss']
})
export class PosteTravailReportComponent implements OnInit, OnChanges {

  @Input() data: any;
  @Input() selectedPage: number;
  dayOrTimeimeHeader: any = [];
  positionList: any = [];
  positionSemaine: any = [];

  constructor() {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.data.currentValue) {
      this.selectedPage = changes.selectedPage.currentValue ? changes.selectedPage.currentValue.page : 0;
      this.selectedPage = changes.data.currentValue.firstGeneration ? 0 : this.selectedPage;
      this.data = {...changes.data.currentValue};
      this.getTableData();
    }
  }

  private getTableData(): void {
    const indexTotal = this.data.data.restaurantDtoList[0].jourDtoList[0].posteTravailDtoList.length - 1;
    if (this.data.vue === 1) {
      this.dayOrTimeimeHeader = this.data.data.restaurantDtoList[0].jourDtoList[0].posteTravailDtoList[indexTotal].intervalleDtoList;
    } else {
      this.dayOrTimeimeHeader = this.data.data.restaurantDtoList[0].jourDtoList.map(day => {
        return day.jourSemaine;
      });
    }
  }

  public getPositionListJour(indexResto) {
    this.positionList = this.data.data.restaurantDtoList[indexResto].jourDtoList[0].posteTravailDtoList.map(d => {
      return d.libelle;
    });
    return this.positionList;
  }

  public getValueCell(indexResto, posteTravail, indexValue) {
    return this.data.data.restaurantDtoList[indexResto].jourDtoList[0].posteTravailDtoList[posteTravail].intervalleDtoList[indexValue];
  }

  public calculeSemaineData(indexResto) {
    const semaineData: any = [];
    this.positionSemaine = this.data.data.restaurantDtoList[indexResto].jourDtoList[0].posteTravailDtoList.map(pos => {
      semaineData.push({position: pos.libelle, day0: 0, day1: 0, day2: 0, day3: 0, day4: 0, day5: 0, day6: 0});
      return pos.libelle;
    });

    this.data.data.restaurantDtoList[indexResto].jourDtoList.forEach((data, indexDay) => {
      data.posteTravailDtoList.forEach((post, indexpost) => {
        semaineData[indexpost]['day' + indexDay] = post.sumPositionforWeek;
      });
    });
    return semaineData;
  }

  public getSommeDay(data) {
    return data.day0 + data.day1 + data.day2 + data.day3 + data.day4 + data.day5 + data.day6;
  }
}
