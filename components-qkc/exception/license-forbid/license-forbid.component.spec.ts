import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseForbidComponent } from './license-forbid.component';

describe('LicenseForbidComponent', () => {
  let component: LicenseForbidComponent;
  let fixture: ComponentFixture<LicenseForbidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LicenseForbidComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LicenseForbidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
