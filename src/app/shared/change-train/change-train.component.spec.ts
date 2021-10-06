import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeTrainComponent } from './change-train.component';

describe('ChangeTrainComponent', () => {
  let component: ChangeTrainComponent;
  let fixture: ComponentFixture<ChangeTrainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeTrainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeTrainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
