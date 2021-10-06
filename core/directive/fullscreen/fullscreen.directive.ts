import { Directive, Input, HostListener, OnDestroy, Output, EventEmitter } from '@angular/core';
import * as screenfull from 'screenfull';
import { Screenfull } from 'screenfull';

/**
 * 隐藏要使用下列方法，不能使用ngIf
 * [style.display]="isFullScreen?'none':'block'"
 */
@Directive({
  selector: '[qkcFullscreen]'
})
export class FullscreenDirective implements OnDestroy {

  // tslint:disable-next-line:no-input-rename
  @Input('fullId') eleId = '';

  @Output() fullScreenChange = new EventEmitter<boolean>();

  sf: Screenfull = screenfull as Screenfull;
  timeHandler: any;

  constructor() {
    this.sf.on('change', this.fullScreenHander);
  }

  fullScreenHander = () => {
    this.fullScreenChange.emit(this.sf.isFullscreen);
    this.timeHandler = setInterval(() => {
      if (!this.sf.isFullscreen) {
        clearInterval(this.timeHandler);
        this.fullScreenChange.emit(this.sf.isFullscreen);
      }
    }, 800);
  }

  @HostListener('click') onClick() {
    if (this.eleId === '') {
      return;
    }
    if (this.sf.isEnabled) {
      const ele = document.getElementById(this.eleId);
      this.sf.toggle(ele);
    }
  }

  ngOnDestroy() {
    this.sf.off('change', this.fullScreenHander);
    if (this.timeHandler) {
      clearInterval(this.timeHandler);
    }
  }
}
