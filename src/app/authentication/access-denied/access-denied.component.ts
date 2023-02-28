import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'rhis-access-denied',
  templateUrl: './access-denied.component.html',
  styleUrls: ['./access-denied.component.scss']
})
export class AccessDeniedComponent implements OnInit {

  constructor(private router: Router) {
    setTimeout(function () {
      window.location.href = '/login';
    }, 2000);

  }

  ngOnInit() {
  }

}
