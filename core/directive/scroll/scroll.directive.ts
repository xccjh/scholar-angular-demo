import { Directive, Input, HostListener} from '@angular/core';
import { QkcScrollService } from './service/qkc-scroll.service';

@Directive({
  selector: '[qkcScroll]'
})
export class ScrollDirective {

  // tslint:disable-next-line:no-input-rename
  @Input('scrollId') eleId = '';

  constructor(private scrollService: QkcScrollService) { }

  @HostListener('click') onClick() {
    if (this.eleId === '') {
      return;
    }
    this.scrollService.scrollToAnchor(this.eleId);
  }
}
