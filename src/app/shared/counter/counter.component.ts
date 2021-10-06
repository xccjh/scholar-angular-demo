import {Component, Input, forwardRef, OnChanges, SimpleChanges} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors, Validator,
  ValidatorFn
} from '@angular/forms';

// 实现双向板锭
export const EXE_COUNTER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CounterComponent),
  multi: true
};
// 实现表单验证
export const EXE_COUNTER_VALIDATOR = {
  provide: NG_VALIDATORS,
  useValue: forwardRef(() => createCounterRangeValidator(10, 20)),
  multi: true
};


export function createCounterRangeValidator(maxValue: number, minValue: number) {
  return (control: AbstractControl): ValidationErrors => {
    return (control.value > +maxValue || control.value < +minValue) ?
      {
        rangeError: {
          current: control.value,
          max: maxValue,
          min: minValue
        }
      } : null;
  };
}

@Component({
  selector: 'exe-counter',
  template: `
    <p>当前值: {{ count }}</p>
    <button (click)="increment()"> +</button>
    <button (click)="decrement()"> -</button>
  `,
  providers: [EXE_COUNTER_VALUE_ACCESSOR, EXE_COUNTER_VALIDATOR] // 注册
})
export class CounterComponent implements ControlValueAccessor, Validator, OnChanges  {
  @Input() countSelf = 0;
  @Input() counterRangeMin: number;
  @Input() counterRangeMax: number;

  get count() {
    return this.countSelf;
  }

  set count(value: number) {
    this.countSelf = value;
    this.propagateChange(this.countSelf);
  }
  private validatorSelf: ValidatorFn;
  private propagateChange = (_: any) => {}

  // 监听输入属性变化，调用内部的_createValidator()方法，创建RangeValidator
  ngOnChanges(changes: SimpleChanges): void {
    if ('counterRangeMin' in changes || 'counterRangeMax' in changes) {
      this._createValidator();
    }
  }

  // 动态创建RangeValidator
  private _createValidator(): void {
    this.validatorSelf = createCounterRangeValidator(this.counterRangeMax,this.counterRangeMin);
  }

  // 执行控件验证
  validate(c: AbstractControl): ValidationErrors | null {
    return this.counterRangeMin === null || this.counterRangeMax === null ?
      null : this.validatorSelf(c);
  }

  writeValue(value: any) {
    if (value !== undefined) {
      this.count = value;
    }
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any) {
  }

  increment() {
    this.count++;
  }

  decrement() {
    this.count--;
  }
}

// FormsModule
// 未设置 CounterComponent 组件初始值
// <exe-counter name="counter" ngModel></exe-counter>
// 设置 CounterComponent 组件初始值 - 使用 [ngModel] 语法
// <exe-counter name="counter" [ngModel]="outerCounterValue"></exe-counter>
// 设置数据双向绑定 - 使用 [(ngModel)] 语法
// <exe-counter name="counter" [(ngModel)]="outerCounterValue"></exe-counter>
// ReactiveFormsModule
// <exe-counter name="counter" formControlName="counter"></exe-counter>



// 完整例子
// @Component({
//   selector: 'exe-app',
//   template: `
//     <form [formGroup]="form">
//       <exe-counter
//       formControlName="counter"
//       counterRangeMax="10"
//       counterRangeMin="0"
//       ></exe-counter>
//     </form>
//     <p *ngIf="!form.valid">Counter is invalid!</p>
//     <pre>{{ form.get('counter').errors | json }}</pre>
//   `,
// })
// export class AppComponent {
//   form: FormGroup;
//
//   constructor(private fb: FormBuilder) { }
//
//   ngOnInit() {
//     this.form = this.fb.group({
//       counter: 5
//     });
//   }
// }
