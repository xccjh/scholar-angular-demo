import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'qkc-media-audio',
  templateUrl: './qkc-media-audio.component.html',
  styleUrls: ['./qkc-media-audio.component.less']
})
export class QkcMediaAudioComponent implements OnInit {

  @Input() title: string;
  @Input() url: string;

  constructor() { }

  ngOnInit() {
  }

}
