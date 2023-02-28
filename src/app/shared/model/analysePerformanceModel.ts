export class ComparativePerformanceSheet{
  data: ComparativePerformance[];
  total: Item<string>[];
  columns:Column[];
  upperHeader: string[];
}
export class   Column {
   code: string;
   title: string;
   unit: string;
}
export class ComparativePerformance {
    periodsInfos: ComparativePerformancePeriod[];
    restaurantName: string;
    // 1 --> sp25 and sp50 are considered
    // 2 --> sp10, sp20 and sp50 are considered
    modeRestaurant: 1 | 2;
  }
  

export class ComparativePerformancePeriod {
    start: string;
    items: Item<number>[];
 }

 export class Item<T> {
    code: string;
    name: string;
    value : T;
 }
