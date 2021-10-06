import { Directive, Input, ElementRef , OnChanges, SimpleChanges, Renderer2 } from '@angular/core';

@Directive({
  selector: '[qkcSpin]'
})
export class QkcSpinDirective implements OnChanges  {

  @Input() spinLoading = false;

  loadingEle: any;

  constructor(private el: ElementRef, private render: Renderer2) {
    this.render.addClass(this.el.nativeElement, 'qkc-spin-container');
    this.loadingEle = this.render.createElement('div');
    this.render.addClass(this.loadingEle, 'loader-03');
  }

  ngOnChanges(changes: SimpleChanges) {
    const { spinLoading } = changes;
    if (spinLoading) {
      if (spinLoading.currentValue) {
        this.render.addClass(this.el.nativeElement, 'qkc-spin-blur');
        this.render.appendChild(this.el.nativeElement, this.loadingEle);
      } else {
        this.render.removeClass(this.el.nativeElement, 'qkc-spin-blur');
        this.render.removeChild(this.el.nativeElement, this.loadingEle);
      }
    }
  }

}
