import {ConfirmableDescription, ConfirmableFlatDescription, Json, LoadingControl} from '../base/common';
import {NzModalRef} from 'ng-zorro-antd';
import {ToolsUtil} from '../utils/tools.util';

// 属性装饰器
export function takeAnInteger() {
  return (target: object, key: string | symbol) => {
    let val = target[key];
    const getter = () => {
      return val;
    };
    const setter = value => {
      val = value.tofix(0);
    };
    Object.defineProperty(target, key, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true
    });
  };
}

export declare interface GetSetCallOption<T> {
  get?: (propertyValue: T) => T;
  set?: (newValue: T, preValue: T) => void;
  initSet?: (newValue: T, preValue: T) => void;
  initValue?: T; // 此处设置初始值不会调用set
}

// 属性装饰器
/*
集中私有属性添加，分化&简化
 */
export function getSetChange<T>(getSetCall: GetSetCallOption<T>) {
  return (target: object, key: string): void => {
    let propertyValue = getSetCall.initValue;
    const label = new Array(16).fill(0).reduce(total => total += Math.floor(Math.random() * 16).toString(16));
    Object.defineProperty(target, key, {
      get() {
        if (this[label]) {
          return getSetCall.get ? getSetCall.get.call(this, propertyValue) : propertyValue;
        } else {
          return getSetCall.get ? getSetCall.get.call(this, getSetCall.initValue) : getSetCall.initValue;
        }
      },
      set(newValue) {
        if (this[label]) {
          getSetCall.set?.call(this, newValue, propertyValue);
        } else {
          this[label] = true;
          if (getSetCall.initSet) {
            getSetCall.initSet.call(this, newValue, propertyValue);
          } else {
            getSetCall.set?.call(this, newValue, propertyValue);
          }
        }
        propertyValue = newValue;
      }
    });
  };
}

// 构造器装饰器
export function extendPrototype(greeting: string) {
  // tslint:disable-next-line:ban-types only-arrow-functions
  return function(target: Function) {
    // tslint:disable-next-line:only-arrow-functions
    target.prototype.greet = function(): void {
      console.log(greeting);
    };
  };
}

// 方法装饰器
export function ConfirmableDesc(params: ConfirmableDescription) {
  return (
    target: object,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    const original = descriptor.value;
    descriptor.value = function(...args: any[]) {
      const {
        title, content, type, replaceXxxField,
        conditionField, conditionResult, conditionTitleReplace, conditionContentReplace, condition
      } = params;
      const conditionIf = typeof condition !== 'undefined';
      // tslint:disable-next-line:max-line-length
      const resultCondition = conditionIf ? condition() : (conditionField && conditionResult && (args[0][conditionField] === conditionResult));
      const resultContent = resultCondition ? conditionContentReplace : content;
      this.modalService[type]({
        nzTitle: resultCondition ? conditionTitleReplace || title : title,
        nzContent: replaceXxxField ? resultContent.replace('xxx', args[0][replaceXxxField]) : resultContent,
        nzMaskClosable: false,
        nzWrapClassName: 'vertical-center-modal',
        nzCancelText: '取消',
        nzOkText: '确定',
        nzOnOk: (e) => {
          const result = original.apply(this, args);
          return result;
        },
        nzOnCancel() {
          return null;
        }
      });
    };
    return descriptor;
  };
}

// 方法装饰器
export function ConfirmableFlat(params: ConfirmableFlatDescription) {
  return (
    target: object,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    const {title, content, type, nzBodyStyle, nzWrapClassName, nzComponentParams, nzOkText, nzCancelText, nzOnCancel} = params;
    const original = descriptor.value;
    descriptor.value = function(...args: any[]) {
      const loadingControl: Partial<LoadingControl> = {};
      const modal: NzModalRef = this.modalService[typeof type === 'function' ? type.call(this, args) : (type || 'info')]({
        nzTitle: typeof title === 'function' ? title.call(this, args) : title,
        nzContent: typeof content === 'function' ? content.call(this, args) : content,
        nzMaskClosable: false,
        nzWrapClassName,
        nzComponentParams,
        nzBodyStyle,
        nzOkText: nzOkText || '确定',
        nzCancelText: nzCancelText || '取消',
        nzOnCancel: () => {
          if (nzOnCancel) {
            return nzOnCancel.apply(this, Array.prototype.concat.call(args, loadingControl, modal));
          }
        },
        nzOnOk: () => {
          return original.apply(this, Array.prototype.concat.call(args, loadingControl, modal));
        },
      });
      ToolsUtil.watchTool(loadingControl, 'loading', false, (val) => {
        modal.updateConfig({nzOkLoading: val});
      });
    };
    return descriptor;
  };
}

// 方法装饰器
// tslint:disable-next-line:ban-types
export function LogOutput(tarage: Function, key: string, descriptor: any) {
  const originalMethod = descriptor.value;
  const newMethod = function(...args: any[]): any {
    const result: any = originalMethod.apply(this, args);
    if (!this.loggedOutput) {
      this.loggedOutput = new Array<any>();
    }
    this.loggedOutput.push({
      method: key,
      parameters: args,
      output: result,
      timestamp: new Date()
    });
    return result;
  };
  descriptor.value = newMethod;
}

// 参数装饰器
// tslint:disable-next-line:ban-types
export function Log(target: Function, key: string, parameterIndex: number) {
  const functionLogged = key || target.prototype.constructor.name;
  console.log(`The parameter in position ${parameterIndex} at ${functionLogged} has
    been decorated`);
}


// 类装饰器
// @Component、@NgModule、@Pipe、@Injectable
// 属性装饰器
// @Input、@Output、@ContentChild、@ContentChildren、@ViewChild、@ViewChildren
// 方法装饰器
// @HostListener
// 参数装饰器
// @Inject、@Optional、@Self、@SkipSelf、@Host


/**
 * Component decorator and metadata.
 */
// export const Component: ComponentDecorator = <ComponentDecorator>makeDecorator(
//   'Component', {
//     selector: undefined, // 用于定义组件在HTML代码中匹配的标签
//     inputs: undefined, // 组件的输入属性
//     outputs: undefined, // 组件的输出属性
//     host: undefined, // 绑定宿主的属性、事件等
//     exportAs: undefined, // 导出指令，使得可以在模板中调用
//     moduleId: undefined, // 包含该组件模块的id，它被用于解析模板和样式的相对路径
//     providers: undefined, // 设置组件及其子组件可以用的服务
//     viewProviders: undefined, // 设置组件及其子组件(不含ContentChildren)可以用的服务
//     changeDetection: ChangeDetectionStrategy.Default, // 指定组件使用的变化检测策略
//     queries: undefined, // 设置组件的查询条件
//     templateUrl: undefined, // 为组件指定一个外部模板的URL地址
//     template: undefined, // 为组件指定一个内联的模板
//     styleUrls: undefined, // 为组件指定一系列用于该组件的样式表文件
//     styles: undefined, // 为组件指定内联样式
//     animations: undefined, // 设置组件相关动画
//     encapsulation: undefined, // 设置组件视图包装选项
//     interpolation: undefined, // 设置默认的插值运算符，默认是"{{"和"}}"
//     entryComponents: undefined // 设置需要被提前编译的组件
//   },
//   Directive);
// 模块注入器和组件注入器，Angular 还提供了第三种注入器，即多级元素注入器
// Angular 会按照三个阶段来解析依赖，起始阶段就是使用多级元素注入器，然后是多级组件注入器，最后是多级模块注入器。
