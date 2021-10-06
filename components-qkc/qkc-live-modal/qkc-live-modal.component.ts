import { Component, OnInit, Input, Output, OnChanges, SimpleChange, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-qkc-live-modal',
  templateUrl: './qkc-live-modal.component.html',
  styleUrls: ['./qkc-live-modal.component.less']
})
export class QkcLiveModalComponent implements OnInit, OnChanges {
  @Input() src: string;
  @Input() isVisible: boolean;
  @Output() isShowChange = new EventEmitter<string>();

  safeUrl: SafeResourceUrl;
  liveClass = 'live-modal';
  isMax = false;
  isMin = false;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {

  }

  ngOnChanges(chngs: { [key: string]: SimpleChange }) {
    if (chngs.src && this.src !== '') {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.src);
    }
    if (chngs.isVisible && this.isVisible) {
      this.isMin = false;
    }
  }

  handleCancel() {
    this.isVisible = false;
    this.liveClass = 'live-modal';
    this.isShowChange.emit('hide');
  }

  maximize() {
    this.liveClass = 'live-modal isMax';
    this.isMax = true;
  }

  reduction() {
    this.liveClass = 'live-modal';
    this.isMax = false;
  }

  minimize() {
    this.isVisible = false;
    this.isMin = true;
    this.isShowChange.emit('minimize');
  }
  showModal() {
    this.isShowChange.emit('show');
    this.isVisible = true;
    this.isMin = false;
  }
}
