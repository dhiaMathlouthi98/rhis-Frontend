import {Component, OnInit} from '@angular/core';
import {TestService} from './services/test.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'rhis-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {

  public dateAsString;
  public idRestaurant = 0;

  public besoinData: any[] = [];
  public shiftData: any[] = [];
  public assocData: any[] = [];

  public besoinKeys: string[] = [];
  public shiftKeys: string[] = [];
  public assocKeys: string[] = [];

  constructor(private testService: TestService, private activatedRoute: ActivatedRoute) {
    this.activatedRoute.params.subscribe((params) => {
      if (params.date && params.id) {
        this.dateAsString = params.date;
        this.idRestaurant = +params.id;
        this.getAssocByDate();
      }
    });
  }

  ngOnInit() {
  }

  private getAssocByDate() {
    this.testService.getAssoc(this.dateAsString, this.idRestaurant).subscribe(
      (data: any) => {
        this.besoinData = data['BESOIN'];
        this.shiftData = data['SHIFT'];
        this.assocData = data['ASSOC'];
        this.besoinKeys = Object.keys(this.besoinData);
        this.shiftKeys = Object.keys(this.shiftData);
        this.assocKeys = Object.keys(this.assocData);
      }
    );
  }
}
