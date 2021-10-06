import {Directive, Input, TemplateRef, ViewContainerRef} from "@angular/core";

@Directive({
  selector: '[exeIf]'
})
export class ExeIfDirective {

  @Input('exeIf')
  set condition(newCondition: boolean) {
    if (!newCondition) { // 创建模板对应的内嵌视图
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  constructor(private templateRef: TemplateRef<any>,
              private viewContainer: ViewContainerRef) {
  }
}

// import { Component } from '@angular/core';
//
// @Component({
//   selector: 'app-root',
//   template: `
//    <h2 *exeIf="condition">Hello, Semlinker!</h2>
//   `,
// })
// export class AppComponent {
//   condition: boolean = false;
// }
