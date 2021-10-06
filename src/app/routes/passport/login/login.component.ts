import {Component, OnInit, Optional, OnDestroy} from '@angular/core';
import {FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd';
import {Router} from '@angular/router';
import {HttpService} from 'core/services/http.service';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {MenuService} from 'core/services/menu.service';
import {Menu} from 'core/base/menus';
import {ToolsUtil} from 'core/utils/tools.util';
import {AtrReuseStrategy} from 'core/routereuse/atr-reuse-strategy';
import {environment} from 'src/environments/environment';
import {timer} from 'rxjs';
import {SessionStorageUtil} from '../../../../../core/utils/sessionstorage.util';
import {MaterialLibraryService} from '@app/busi-services';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit, OnDestroy {

  isLoading = false;

  constructor(
    fb: FormBuilder,
    private router: Router,
    public msg: NzMessageService,
    private httpService: HttpService,
    private menuService: MenuService,
    private materialLibService: MaterialLibraryService,
  ) {
    this.form = fb.group({
      userName: [null, [Validators.required, Validators.minLength(4), this.checkUserName()]],
      password: [null, Validators.required],
      remember: [true],
    });
  }

  // #region fields

  get userName() {
    return this.form.controls.userName;
  }

  get password() {
    return this.form.controls.password;
  }

  form: FormGroup;
  error = '';

  // #region get captcha

  count = 0;


  loginOut() {
    LocalStorageUtil.clearAll();
    SessionStorageUtil.clear();
    this.menuService.clear();
    AtrReuseStrategy.deleteAll();
  }

  submit() {
    this.loginOut();
    this.error = '';
    this.userName.markAsDirty();
    this.userName.updateValueAndValidity();
    this.password.markAsDirty();
    this.password.updateValueAndValidity();
    if (this.userName.invalid || this.password.invalid) {
      return;
    }
    const params = {
      userName: this.userName.value,
      password: this.password.value,
      orgCode: ToolsUtil.getOrgCode(),
      platformId: window['__platform__']
    };
    this.isLoading = true;
    this.httpService.post('sys/user/login', params).subscribe(result => {
      this.isLoading = false;
      if (result.status === 200) {
        if (this.form.value.remember) {
          LocalStorageUtil.putLogin(params);
        } else {
          LocalStorageUtil.removeLogin();
        }
        if (result.data.user && result.data.user.telphone) {
          result.data.user.password = this.password.value;
          LocalStorageUtil.putUser(result.data.user);
        } else {
          this.msg.error('获取管理员信息出错');
        }
        if (!LocalStorageUtil.getCodeUid()) {
          this.putCodeUid();
        }
        this.menuService.clear();
        this.menuService.loadMenus().subscribe(ret => {
          this.isLoading = false;

          const url = this.initBaseUrl(ret);

          if (url && url !== '') {
            this.router.navigateByUrl(url, {replaceUrl: true});
          } else {
            this.msg.error('暂无权限登陆！');
          }
        }, error => {
          this.isLoading = false;
          console.log(error);
        });
        // this.getQuestionBanktoken(params.userName);
        // this.getAdmin();

      } else {
        this.isLoading = false;
      }

    }, error => {
      console.log(error);
      this.isLoading = false;
    });
    // 默认配置中对所有HTTP请求都会强制 [校验](https://ng-alain.com/auth/getting-started) 用户 Token
    // 然一般来说登录请求不需要校验，因此可以在请求URL加上：`/login?_allow_anonymous=true` 表示不触发用户 Token 校验
  }

  putCodeUid() {
    this.materialLibService.getCodeUid().subscribe(res => {
      if (res.status === 200) {
        LocalStorageUtil.putCodeUid(res.data.uid);
      }
    });
  }

  getQuestionBanktoken(userName) {
    ToolsUtil.getAjax(environment.questionBankApi + 'sign/commonlogin/qkcloginbyUP', {
      secret: 'qkclogin',
      userName
    }).subscribe(data => {
      try {
        const res = JSON.parse(data);
        if (res.code === 200) {
          LocalStorageUtil.putTkToken(res.data);
          this.refreshToken();
        } else {
          this.msg.error(data);
        }
      } catch (e) {
        this.msg.error(data || e);
      }
    });
  }

  refreshToken() {
    timer(2 * 60 * 50 * 1000).subscribe(() => {
      const userName = LocalStorageUtil.getLogin().userName;
      if (userName) {
        this.getQuestionBanktoken(userName);
      }
    });
  }


  // #region social

  initBaseUrl(menuList: Menu[]): string {
    let baseUrl = '';
    for (const item of menuList) {
      if (item.link && item.isVisible === '1') {
        baseUrl = item.link;
        break;
      } else if (item.children && item.children.length > 0) {
        baseUrl = this.initBaseUrl(item.children);
        if (baseUrl !== '') {
          break;
        }
      }
    }
    return baseUrl;
  }

  ngOnInit() {
    const loginInfo = LocalStorageUtil.getLogin();
    if (loginInfo.userName !== undefined && loginInfo.password !== undefined) {
      this.userName.setValue(loginInfo.userName);
      this.userName.markAsDirty();
      this.userName.updateValueAndValidity();
      this.password.setValue(loginInfo.password);
      this.password.markAsDirty();
      this.password.updateValueAndValidity();
    }
  }

  // #endregion

  ngOnDestroy(): void {
  }

  // getAdmin() {
  //   const options = { isCommonHttpHeader: true };
  //   this.httpService.post('sys/user/getAdmin', {}, options).subscribe(res => {
  //     if (res.status === 200) {
  //       LocalStorageUtil.putAdminUser(res.data);
  //       console.log(res.data)
  //     }
  //   }, error => {

  //   });
  // }

  checkUserName(): ValidatorFn {
    return (contrl: AbstractControl): { [key: string]: any } | null => {
      const nameExp = /^[0-9a-zA-Z]+$/;
      const forbidden = nameExp.test(contrl.value);
      return !forbidden && contrl.value ? {confirm: {value: contrl.value}} : null;
    };
  }


}
