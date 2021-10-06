import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// import { VgCoreModule } from 'videogular2/compiled/core';
// import { VgControlsModule } from 'videogular2/compiled/controls';
// import { VgOverlayPlayModule } from 'videogular2/compiled/overlay-play';
// import { VgBufferingModule } from 'videogular2/compiled/buffering';

import { VgCoreModule, VgControlsModule, VgOverlayPlayModule, VgBufferingModule } from 'ngx-videogular';

import { QkcMediaVideoComponent } from './qkc-media-video/qkc-media-video.component';
import { QkcMediaAudioComponent } from './qkc-media-audio/qkc-media-audio.component';


const Videogular2Module = [
  VgCoreModule,
  VgControlsModule,
  VgOverlayPlayModule,
  VgBufferingModule
];

@NgModule({
  declarations: [QkcMediaVideoComponent, QkcMediaAudioComponent],
  imports: [
    CommonModule,
    ...Videogular2Module
  ],
  exports: [
    QkcMediaVideoComponent, QkcMediaAudioComponent
  ]
})
export class QkcMediaModule { }
