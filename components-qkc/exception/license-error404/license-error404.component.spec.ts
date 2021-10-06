import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseError404Component } from './license-error404.component';

describe('LicenseError404Component', () => {
  let component: LicenseError404Component;
  let fixture: ComponentFixture<LicenseError404Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LicenseError404Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LicenseError404Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
