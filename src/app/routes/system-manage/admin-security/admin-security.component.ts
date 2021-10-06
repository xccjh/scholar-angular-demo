import { Component, OnInit } from '@angular/core';
import { Router} from '@angular/router'; // 导入router服务
import { NzMessageService } from 'ng-zorro-antd/message';
import { LocalStorageUtil } from 'core/utils/localstorage.util';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AdminSecurityService } from './admin-security.service';
import { MenuService } from 'core/services/menu.service';

@Component({
  selector: 'app-admin-security',
  templateUrl: './admin-security.component.html',
  styleUrls: ['./admin-security.component.less'],
  providers: [AdminSecurityService]
})
export class AdminSecurityComponent implements OnInit {
  isLoading = false;
  // 密码修改框是否打开
  passwordForm: FormGroup;
  // 旧密码，用于密码修改比较
  oldPassword = '';
  // 管理员信息
  adminInfo: any = {
    userName: '',
    telphone: ''
  };

  sendPhoneDisabled = false;
  time = 60;
  // 是否第一次获取验证码
  isFirstGetCode = true;

  isPassLoading = false;
  oldCode = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private message: NzMessageService,
    private menuService: MenuService,
    private adminSecurityService: AdminSecurityService
  ) { }

  ngOnInit(): void {
    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required, this.confirmationValidator]],
      code: ['', [Validators.required]]
    });
    this.getAdminInfo();
  }

  // 获取管理员信息
  getAdminInfo() {
    this.isLoading = true;
    this.adminInfo = LocalStorageUtil.getUser();
    const success = (result: any) => {
      if (result.status === 200) {
        this.isLoading = false;
        this.adminInfo = result.data;
      }
    };

    const error = (err: any) => {
      this.isLoading = false;
      this.message.create('error', JSON.stringify(err));
    };
    this.adminSecurityService.getAdminInfo({
      id: LocalStorageUtil.getUser().id
    }).subscribe(success, error);
  }

  // 获取手机验证码
  getVerCode() {
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
    this.adminSecurityService.getVerCode(this.adminInfo.telphone).subscribe(success, error);
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


  // 保存修改密码，弹出获取手机验证码框
  modifyPassword() {
    // tslint:disable-next-line:forin
    for (const key in this.passwordForm.controls) {
      this.passwordForm.controls[key].markAsDirty();
      this.passwordForm.controls[key].updateValueAndValidity();
    }
    if (this.passwordForm.valid) {
      if ( this.passwordForm.get('password').value !== this.oldPassword ) {
        this.message.create('error', '旧密码不正确，请重新输入');
        return false;
      }
    }
  }

  // 最终的保存密码
  sureModifyPass() {
    if (!this.passwordForm.valid) {
      this.message.create('error', '请按规则填写所有项');
      return false;
    }

    this.isPassLoading = true;

    const params = {
      password: this.passwordForm.value.newPassword,
      phone: this.adminInfo.telphone,
      code: this.passwordForm.value.code
    };
    const success = (result: any) => {
      this.isPassLoading = false;
      if (result.status === 201) {
        this.message.create('success', '修改密码成功！请重新登录');
        this.router.navigateByUrl('/p/login');
      }
    };

    const error = (err: any) => {
      this.isPassLoading = false;
      this.message.create('error', JSON.stringify(err));
    };
    this.adminSecurityService.sendModifyPassword(params).subscribe(success, error);
  }
  // 确认两次密码是否一致
  updateConfirmValidator(): void {
    Promise.resolve().then(() => this.passwordForm.controls.confirmPassword.updateValueAndValidity());
  }

  // 确认两次密码是否一致
  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.passwordForm.controls.newPassword.value) {
      return { confirm: true, error: true };
    }
    return {};
  }

  goBack() {
    this.menuService.goBack();
  }

  pwdFocus(e) {
    // e.target.setAttribute('type', 'password');
  }

  formKeydown(e: any) {
    if (e.keyCode === 13) {
      return false;
    }
    return true;
  }

}
