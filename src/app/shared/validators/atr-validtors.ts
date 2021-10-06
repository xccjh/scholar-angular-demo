import {ValidatorFn, AbstractControl, ValidationErrors} from '@angular/forms';

// required   maxLength minLength email  pattern  Validators.pattern('[a-z0-9._%+_]+@[a-z0-9.-]+')
// myControl.setValidators([Validators.required, Validators.maxLength(6)]);
// myControl.clearValidators();
// myControl.updateValueAndValidity();

// valid - 表单控件有效
// invalid - 表单控件无效
// pristine - 表单控件值未改变
// dirty - 表单控件值已改变
// touched - 表单控件已被访问过
// untouched - 表单控件未被访问过

// 手机号验证
export function telphoneValidator(): ValidatorFn {
  return (contrl: AbstractControl): { [key: string]: any } | null => {
    const nameExp = new RegExp('^1[3456789]\\d{9}$');
    const forbidden = nameExp.test(contrl.value);
    return !forbidden && contrl.value ? {telphone: {value: contrl.value}} : null;
  };
}


// 验证输入空格
export function spaceValidator(): ValidatorFn {
  return (contrl: AbstractControl): { [key: string]: any } | null => {
    if (contrl.value && typeof (contrl.value) === 'string') {
      const forbidden = contrl.value.trim() === '';
      return forbidden ? {required: true} : null;
    } else {
      return null;
    }
  };
}


// 最大长度验证
export function maxLengthValidator(num: number): ValidatorFn {
  return (contrl: AbstractControl): { [key: string]: any } | null => {
    if (contrl.value && typeof (contrl.value) === 'string') {
      const forbidden = contrl.value.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, 'a')
        .replace(/\s/g, 'a').replace(/[\u0391-\uFFE5]/g, 'a').length > num;
      return forbidden ? {number: true} : null;
    } else {
      return null;
    }
  };
}


// 重名
export function repeatName(data: any[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!data) {
      return null;
    }
    const chapterName = (control.value as string).trim();
    const isExist = data.some(chapter => chapter.name === chapterName);
    return isExist ? {repeatName: true} : null;
  };
}


// 跨字段验证
function emailMatcher(c: AbstractControl) {
  const emailControl = c.get('email');
  const confirmControl = c.get('confirmEmail');
  if (emailControl.pristine || confirmControl.pristine) {
    return null;
  }
  return emailControl.value === confirmControl.value ? null : { match: true };
}

// 用法
// this.signupForm = this.fb.group({
//   userName: ['', [Validators.required, Validators.minLength(6)]],
//   emailGroup: this.fb.group({
//     email: ['', [Validators.required, Validators.email]],
//     confirmEmail: ['', [Validators.required]],
//   }, { validator: emailMatcher })
// });

// 年龄验证器
function ageRange(min: number, max: number): ValidatorFn {
  return (c: AbstractControl): { [key: string]: any } | null => {
    const age = c.value;
    if (age && (isNaN(age) || age < min || age > max)) {
      return { range: true, min, max };
    }
    return null;
  };
}
