import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachmentShowModalComponent } from './attachment-show-modal.component';

describe('AttachmentShowModalComponent', () => {
  let component: AttachmentShowModalComponent;
  let fixture: ComponentFixture<AttachmentShowModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttachmentShowModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachmentShowModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
