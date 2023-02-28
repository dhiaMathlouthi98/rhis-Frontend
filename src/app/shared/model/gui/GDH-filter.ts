export interface GDHFilter {
  date?: string;
  weekStartDate?: string | Date;
  weekEndDate?: string | Date;
  onlyManagers?: boolean;
  onlyEmployees?: boolean;
  firstLastName?: string;
  // true for asc , false for desc
  order?: boolean;
}
