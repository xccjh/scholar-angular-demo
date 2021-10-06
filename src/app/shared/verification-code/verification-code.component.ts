import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LocalStorageUtil } from 'core/utils/localstorage.util';
import { ToolsUtil } from 'core/utils/tools.util';
import { VerificationCodeService } from './verification-code.service';

@Component({
  selector: 'app-verification-code',
  templateUrl: './verification-code.component.html',
  styleUrls: ['./verification-code.component.less'],
  providers: [VerificationCodeService]
})
export class VerificationCodeComponent implements OnInit, OnChanges {
  @Input() isShow = false;
  // tslint:disable-next-line:no-output-rename
  @Output('closeModal') close = new EventEmitter<any>();
  // tslint:disable-next-line:no-output-rename
  @Output('modifyCode') sendCode = new EventEmitter<any>();
  verCodeForm: FormGroup;
  telphone = LocalStorageUtil.getAdminUser().telphone || '';
  // 重新获取验证码
  sendPhoneDisabled = false;
  time = 60;
  isLoading = false;
  // 是否第一次获取验证码
  isFirstGetCode = true;
  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private verificationCode: VerificationCodeService
  ) { }

  ngOnInit() {
    this.verCodeForm = this.fb.group({
      verCode: [ '',  Validators.required]
    });
  }
  ngOnChanges(change: SimpleChanges): void {
    ToolsUtil.diffInput(change['isShow'], () => {
      if ( this.isShow ) {
        this.telphone = LocalStorageUtil.getAdminUser().telphone || '';
        this.verCodeForm.reset();
        // tslint:disable-next-line:forin
        for (const key in this.verCodeForm.controls) {
          this.verCodeForm.controls[key].markAsUntouched();
          this.verCodeForm.controls[key].markAsPristine();
          this.verCodeForm.controls[key].updateValueAndValidity();
        }
      }
    });
  }
  // 旧发送验证码
  modifyVerCode() {
    // tslint:disable-next-line:forin
    for (const key in this.verCodeForm.controls) {
      this.verCodeForm.controls[key].markAsDirty();
      this.verCodeForm.controls[key].updateValueAndValidity();
    }
    if (this.verCodeForm.valid) {
      this.isLoading = true;
      const success = (result: any) => {
        this.isLoading = false;
        if (result.status === 200) {
          this.sendCode.emit(this.verCodeForm.value.verCode);
        }
      };

      const error = (err: any) => {
        this.isLoading = false;
        this.message.create('error', JSON.stringify(err));
      };
      this.verificationCode.checkCode(this.verCodeForm.value.verCode, this.telphone).subscribe(success, error);

    }
  }
  // 获取手机验证码
  getVerCode() {
    this.isFirstGetCode = false;
    this.isLoading = true;
    const success = (result: any) => {
      this.isLoading = false;
      if (result.status === 201) {
        this.changePhoneDisabled();
      }
    };

    const error = (err: any) => {
      this.isLoading = false;
      this.message.create('error', JSON.stringify(err));
    };
    this.verificationCode.getVerCode(this.telphone).subscribe(success, error);
  }
  // 重新获取倒计时
  changePhoneDisabled() {
    if (this.sendPhoneDisabled) {
      return false;
    }
    this.sendPhoneDisabled = true;
    const interval = window.setInterval(() => {
      if ((this.time--) <= 0) {
        this.time = 60;
        this.sendPhoneDisabled = false;
        window.clearInterval(interval);
      }
    }, 1000);
  }
  closeModals() {
    this.close.emit(false);
  }
}
