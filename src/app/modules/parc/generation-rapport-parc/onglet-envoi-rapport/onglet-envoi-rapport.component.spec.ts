import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OngletEnvoiRapportComponent } from './onglet-envoi-rapport.component';

describe('OngletEnvoiRapportComponent', () => {
  let component: OngletEnvoiRapportComponent;
  let fixture: ComponentFixture<OngletEnvoiRapportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OngletEnvoiRapportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OngletEnvoiRapportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
