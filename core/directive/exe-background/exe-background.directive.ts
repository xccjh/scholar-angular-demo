import {Directive, Input, ElementRef, HostListener, Renderer2} from '@angular/core';

// @ts-ignore
@Directive({
  selector: '[exeBackground]'
})
export class ExeBackgroundDirective {
  @Input('defaultColor')
  defaultColor = 'yellow';
  @Input('exeBackground')
  backgroundColor: string; // 输入属性，用于设置元素的背景颜色

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {
    this.setStyle(this.defaultColor);
  }

  @HostListener('crendererlick')
  onClick() { // 监听宿主元素的点击事件，设置元素背景色
    this.setStyle(this.backgroundColor || this.defaultColor);
  }

  private setStyle(color: string) { // 调用对象提供的API设置元素的背景颜色
    this.renderer.setStyle(this.elementRef.nativeElement,
      'backgroundColor', color);
  }
}
