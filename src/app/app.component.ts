import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import {ToolsUtil} from 'core/utils/tools.util';
import {Router, NavigationEnd, ActivatedRoute} from '@angular/router';
import {MenuService} from 'core/services/menu.service';
import {environment} from '../environments/environment';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {NzMessageService} from 'ng-zorro-antd/message';
import {timer} from 'rxjs';
import {Meta} from '@angular/platform-browser';
import {DOCUMENT} from '@angular/common';
import {MaterialLibraryService} from '@app/busi-services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  title = '教研平台';


  constructor(private router: Router,
              private menuService: MenuService,
              private route: ActivatedRoute,
              private nzMsg: NzMessageService,
              private meta: Meta,
              private materialLibService: MaterialLibraryService,
              private renderer2: Renderer2,
              @Inject(DOCUMENT) private doc: Document,
  ) {
    // const node = this.renderer2.createElement('base');
    // node.href = process.env.platformPath;
    // const base = this.doc.getElementById('base');
    // const head = this.doc.getElementById('head');
    // this.renderer2.appendChild(head, node);
    // this.renderer2.removeChild(head, base);
    menuService.setMenuUrl('sys/menu/getUserMenus');
  }

  ngOnInit(): void {
    // 标记这个应用是谁，mng是管理后台，可用于获取getOrgCode
    // window['__WHO__'] = 'sys';
    // 平台id
    LocalStorageUtil.putOrgCode();
    window['__platform__'] = 'platform-scholar';
    if (environment.https) {
      this.meta.addTag({httpEquiv: 'Content-Security-Policy', content: 'upgrade-insecure-requests'});
    }

    if (!LocalStorageUtil.getCodeUid() && LocalStorageUtil.getUserId()) {
      this.putCodeUid();
    }
    // this.getQuestionBanktoken();
    // this.refreshToken();
    // 监听路由跳转设置tab
    this.router.events
      .subscribe((event) => {
        if (event instanceof NavigationEnd) { // 当导航成功结束时执行
          this.menuService.setCurUrlTab(event.url);
        }
      });
  }

  putCodeUid() {
    this.materialLibService.getCodeUid().subscribe(res => {
      if (res.status === 200) {
        LocalStorageUtil.putCodeUid(res.data.uid);
      }
    });
  }

  refreshToken() {
    timer(24 * 60 * 59 * 1000).subscribe(() => {
      this.getQuestionBanktoken();
    });
  }

  getAdminUser(func) {
    const uerInfo = LocalStorageUtil.getLogin();
    if (!uerInfo.userName) {
      timer(1000).subscribe(() => {
        this.getAdminUser(func);
      });
    } else {
      func(uerInfo);
    }
  }


  getQuestionBanktoken() {
    this.getAdminUser((userInfo) => {
      ToolsUtil.getAjax(environment.questionBankApi + 'sign/commonlogin/qkcloginbyUP', {
        secret: 'qkclogin',
        userName: userInfo.userName
      }).subscribe(data => {
        try {
          const res = JSON.parse(data);
          if (res.code === 200) {
            LocalStorageUtil.putTkToken(res.data);
          } else {
            this.nzMsg.error(data);
          }
        } catch (e) {
          this.nzMsg.error(data || e);
        }
      });
    });
  }

}
