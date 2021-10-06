import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QkcMediaAudioComponent } from './qkc-media-audio.component';

describe('QkcMediaAudioComponent', () => {
  let component: QkcMediaAudioComponent;
  let fixture: ComponentFixture<QkcMediaAudioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QkcMediaAudioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QkcMediaAudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
