import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherPreviewComponent } from './teacher-preview.component';

describe('TeacherPreviewComponent', () => {
  let component: TeacherPreviewComponent;
  let fixture: ComponentFixture<TeacherPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
