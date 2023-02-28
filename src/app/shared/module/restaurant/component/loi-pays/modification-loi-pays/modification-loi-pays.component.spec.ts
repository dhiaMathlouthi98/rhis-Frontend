import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ModificationLoiPaysComponent} from './modification-loi-pays.component';

describe('ModificationLoiPaysComponent', () => {
  let component: ModificationLoiPaysComponent;
  let fixture: ComponentFixture<ModificationLoiPaysComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModificationLoiPaysComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModificationLoiPaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
