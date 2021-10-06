import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseError500Component } from './license-error500.component';

describe('LicenseError500Component', () => {
  let component: LicenseError500Component;
  let fixture: ComponentFixture<LicenseError500Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LicenseError500Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LicenseError500Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
