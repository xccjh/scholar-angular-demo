import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'qkc-media-video',
  templateUrl: './qkc-media-video.component.html',
  styleUrls: ['./qkc-media-video.component.less']
})
export class QkcMediaVideoComponent implements OnChanges {

  @Input() url: string;

  sourceVideos: string [] = [];

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    const { url } = changes;
    if (url && url.currentValue) {
      this.sourceVideos = [ this.url ];
    }
  }

}
