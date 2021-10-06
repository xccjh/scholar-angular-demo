import { Directive, Input, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[atrErrorImg]'
})
export class AtrErrorImgDirective  {

    @Input('atrErrorImg') errorImagSrc: string;
    constructor(public elementRef: ElementRef) { }

    @HostListener('error', ['$event.target'])
    ImageError(event) {
        if (this.errorImagSrc) {
            event.src = this.errorImagSrc;
        } else {
            event.src = 'https://atr-demo.oss-cn-hangzhou.aliyuncs.com/common/null.png';
        }
    }
}
