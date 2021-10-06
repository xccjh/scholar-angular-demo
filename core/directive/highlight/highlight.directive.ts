import {Directive, HostListener, ElementRef, Renderer2} from '@angular/core';

@Directive({
  selector: '[highlight]'
})
export class HighlightDirective {
  constructor(private el: ElementRef, private renderer2: Renderer2) {
  }

  @HostListener('document:click', ['$event'])
  onClick(btn: Event) {
    if (this.el.nativeElement.contains(event.target)) {
      this.highlight('yellow');
    } else {
      this.highlight(null);
    }
  }

  highlight(color: string) {
    this.renderer2.setStyle(this.el.nativeElement, 'backgroundColor', color);
  }
}

// <h4 highlight>点击该区域，元素会被高亮。点击其它区域，元素会取消高亮</h4>
