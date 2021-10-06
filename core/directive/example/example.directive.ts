// export interface Directive {
//   selector?: string;  // 用于定义组件在HTML代码中匹配的标签
//   inputs?: string[];  // 指令的输入属性
//   outputs?: string[];  // 指令的输出属性
//   host?: {[key: string]: string};  // 绑定宿主的属性、事件等
//   providers?: Provider[];  // 设置指令及其子指令可以用的服务
//   exportAs?: string;  // 导出指令，使得可以在模板中调用
//   queries?: {[key: string]: any};  // 设置指令的查询条件
// }
//
// export interface Component extends Directive {
//   changeDetection?: ChangeDetectionStrategy;  // 指定组件使用的变化检测策略
//   viewProviders?: Provider[];     // 设置组件及其子组件(不含ContentChildren)可以用的服务
//   moduleId?: string;  // 包含该组件模块的 id，它被用于解析 模版和样式的相对路径
//   templateUrl?: string;  // 为组件指定一个外部模板的URL地址
//   template?: string;  // 为组件指定一个内联的模板
//   styleUrls?: string[];  // 为组件指定一系列用于该组件的样式表文件
//   styles?: string[];  // 为组件指定内联样式
//   animations?: any[];  // 设置组件相关动画
//   encapsulation?: ViewEncapsulation;  // 设置组件视图包装选项
//   interpolation?: [string, string];  // 设置默认的插值运算符，默认是"{{"和"}}"
//   entryComponents?: Array<Type<any>|any[]>;  // 设置需要被提前编译的组件
// }

// 指令与组件共有的钩子
// ngOnChanges
// ngOnInit
// ngDoCheck
// ngOnDestroy
// 组件特有的钩子
// ngAfterContentInit
// ngAfterContentChecked
// ngAfterViewInit
// ngAfterViewChecked

// export interface OnChanges { ngOnChanges(changes: SimpleChanges): void; }
// export interface OnInit { ngOnInit(): void; } 该钩子方法会在第一次 ngOnChanges 之后被调用
// export interface DoCheck { ngDoCheck(): void; }
// export interface OnDestroy { ngOnDestroy(): void; }
// export interface AfterContentInit { ngAfterContentInit(): void; }
// export interface AfterContentChecked { ngAfterContentChecked(): void; }
// export interface AfterViewInit { ngAfterViewInit(): void; }
// export interface AfterViewChecked { ngAfterViewChecked(): void; }

// 用于表示变化对象
// export class SimpleChange {
//   constructor(public previousValue: any,
//               public currentValue: any,
//               public firstChange: boolean) {}
//   // 标识是否为首次变化
//   isFirstChange(): boolean { return this.firstChange; }
// }

import {Directive, HostBinding, HostListener, Input, Attribute} from '@angular/core';

@Directive({
  selector: '[example]'
})
export class ExampleDirective {
  @Input() example: string;

  @HostBinding() get innerText() {
    return this.example;
  }

  @HostListener('click', ['$event'])
  onClick(event) {
    this.example = 'Clicked!';
    console.dir(event);
  }

  constructor(@Attribute('author') public author: string) {
    console.log(author);
  }
}

// import { Component } from '@angular/core';
//
// @Component({
//   selector: 'app-root',
//   template: `
//     <h2>Hello, Angular</h2>
//     <h2 [example]="'Hello, Xccjh!'"
//       author="Xccjh">Hello, Angular</h2>
//   `,
// })
// export class AppComponent { }



