import {Component, Inject, LOCALE_ID, OnInit} from '@angular/core';
import {MenuService} from 'core/services/menu.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NotifyService} from 'core/services/notify.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {spaceValidator} from '@app/shared/validators/atr-validtors';
import {parseToObject, ToolsUtil} from 'core/utils/tools.util';
import {Decrypt} from 'core/utils/crypto';
import {ActivatedRoute, Router} from '@angular/router';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {HttpService} from 'core/services/http.service';
import {formatDate} from '@angular/common';


@Component({
  selector: 'app-code-page',
  templateUrl: './code-page.component.html',
  styleUrls: ['./code-page.component.less']
})
export class CodePageComponent implements OnInit {
  formGroup: FormGroup;


  constructor(
    public fb: FormBuilder,
    public modalService: NzModalService,
    public menuService: MenuService,
    public courseMgService: CourseManageService,
    public message: NzMessageService,
    public notify: NotifyService,
    private router: Router,
    private route: ActivatedRoute,
    private httpService: HttpService,
    @Inject(LOCALE_ID) public locale: string
  ) {

  }

  ngOnInit() {
    this.formGroup = this.fb.group({
      code: ['', [Validators.required, spaceValidator(), Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  login(userName, password) {
    return new Promise((resolve) => {
      const params = {
        userName,
        password,
        orgCode: ToolsUtil.getOrgCode(),
        platformId: window['__platform__']
      };
      this.httpService.post('sys/user/login', params).subscribe(result => {
        if (result.status === 200) {
          if (result.data.user && result.data.user.telphone) {
            LocalStorageUtil.putUser(result.data.user);
            resolve(true);
          } else {
            this.message.error('获取临时登录信息出错');
            resolve(false);
          }
        } else {
          resolve(false);
        }
      }, () => {
        resolve(false);
      });
    });

  }

  coursePackageView() {
    // tslint:disable-next-line:forin
    for (const i in this.formGroup.controls) {
      this.formGroup.controls[i].markAsUntouched();
      this.formGroup.controls[i].markAsPristine();
      this.formGroup.controls[i].updateValueAndValidity();
    }
    if (this.formGroup.valid) {
      const prexUrl = window.location.href.split('#')[0] + '#/p/';
      const verson = window.location.search.split('=');
      let prePath = location.href;
      if (verson && verson[1]) {
        prePath = location.href.replace('=' + verson[1], '');
      }
      const path = prePath.replace(prexUrl, '');
      if (path) {
        try {
          const info = this.route.snapshot.paramMap.get('info');
          if (info) {
            const decryptionPath = Decrypt(decodeURIComponent(info), this.formGroup.value.code);
            if (decryptionPath) {
              const pathArr = decryptionPath.split('@');
              if (pathArr) {
                const pcode = this.route.snapshot.paramMap.get('pcode');
                if (pcode) {
                  const expireDate = pathArr[0];
                  const userName = pathArr[1];
                  const password = pathArr[2];
                  const now = new Date().getTime();
                  const realUrl = path.split('/' + pcode)[0];
                  if (realUrl) {
                    if ((expireDate < now)) {
                      LocalStorageUtil.removeUser();
                      this.message.error('验证码已过期，请联系分享作者重新分享链接');
                    } else {
                      const success = (result: any) => {
                        if (result.status === 200) {
                          if (result.data.length) {
                            const item = result.data[0];
                            SessionStorageUtil.putPacketInfo(item, false);
                            SessionStorageUtil.clearChapterSelection();
                            this.router.navigateByUrl('/' + realUrl);
                          } else {
                            this.message.error('分享的课包不存在，请联系分享作者确认是否删除了分享课包');
                          }
                        }
                      };
                      const error = (err: any) => {
                        this.message.create('error', JSON.stringify(err));
                      };
                      if (!LocalStorageUtil.getUserToken()) {
                        this.login(userName, password).then((flag) => {
                          if (flag) {
                            this.getDataList(pcode).subscribe(success, error);
                          }
                        });
                      } else {
                        this.getDataList(pcode).subscribe(success, error);
                      }
                    }
                  } else {
                    this.message.error('分享地址信息有误，请联系分享作者重新生成地址');
                    LocalStorageUtil.removeUser();
                  }
                } else {
                  this.message.error('分享地址信息有误，请联系分享作者重新生成地址');
                  LocalStorageUtil.removeUser();
                }
              } else {
                this.message.error('验证码错误，请联系分享作者重新获取验证码');
                LocalStorageUtil.removeUser();
              }
            } else {
              this.message.error('验证码错误，请联系分享作者重新获取验证码');
              LocalStorageUtil.removeUser();
            }
          } else {
            this.message.error('分享地址信息有误，请联系分享作者重新生成地址');
          }
        } catch (e) {
          this.message.error('验证码错误，请联系分享作者重新获取验证码');
          LocalStorageUtil.removeUser();
        }
      } else {
        this.message.error('验证码错误，请联系分享作者重新获取验证码');
        LocalStorageUtil.removeUser();
      }

    }
  }

  getDataList(pcode) {
    const param: any = {
      page: 1,
      limit: 1,
      searchKey: pcode
    };
    return this.courseMgService.listPackets(param);
  }

  clearCode() {
    this.formGroup.patchValue({code: null});
  }
}
