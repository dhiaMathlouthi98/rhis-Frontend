
export class Page {

  content: any[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: any;
  size: number;
  sort: any;
  totalElements: number;
  totalPages: number;


  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
