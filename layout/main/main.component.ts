import {AfterViewInit, Component, ElementRef, Inject, OnInit, Renderer2, TemplateRef, ViewChild} from '@angular/core';
import {MenuService} from 'core/services/menu.service';
import {Router, ActivatedRoute} from '@angular/router';
import {AtrReuseStrategy} from 'core/routereuse/atr-reuse-strategy';
import {Menu} from 'core/base/menus';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {environment} from 'src/environments/environment';
import {ToolsUtil} from 'core/utils/tools.util';
import {DOCUMENT} from '@angular/common';
import {
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  // CdkDropListContainer,
  moveItemInArray, CdkDrag
} from '@angular/cdk/drag-drop';
import {timer} from 'rxjs';
import {NzMessageService} from 'ng-zorro-antd/message';

@Component({
  selector: 'app-layout-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.less'],
})
export class LayoutMainComponent implements OnInit {
  isCollapsed = false;
  schoolName = '';
  menus = [];
  index = -1;
  tabs: Menu[] = [];
  user: any = {};
  imagePrefix = environment.OSS_URL;
  defaultLogo = 'assets/images/logo_hengqi.png';
  private listen: () => void;
  private currentTabIndex: any;
  @ViewChild('menuClick', {static: true}) menu: ElementRef;


  constructor(private menuService: MenuService,
              private router: Router,
              private renderer2: Renderer2,
              private msg: NzMessageService,
              @Inject(DOCUMENT) private doc: Document
  ) {
  }

  ngOnInit() {
    const userName = LocalStorageUtil.getLogin().userName;
    if (userName) {
      this.getQuestionBanktoken(userName);
    }
    this.schoolName = LocalStorageUtil.getSchoolName();
    this.user = LocalStorageUtil.getUser();
    this.defaultLogo = LocalStorageUtil.getOrgInfo().logo
      ? ToolsUtil.getOssUrl(LocalStorageUtil.getOrgInfo().logo)
      : this.defaultLogo;


    const fail = (error) => {
      console.log(error);
    };


    // 订阅获取菜单服务
    this.menuService.loadMenus().subscribe((result) => {

      this.menus = result;
      const path = this.router.url;
      this.tabs = this.restoreMenus();
      if (this.tabs.length === 0) {
        if (this.initBaseOpenTab(this.menus, path)) {
          this.index = 0;
          this.tabChange(0);
        } else {
          // 跳转到无权访问页面
        }
      } else {
        this.setCurMenuLight(path);
      }
    }, fail);


    // 订阅路由跳转
    this.menuService.getUrlChange().subscribe((result) => {
      if (result.url) {
        this.goUrl(result.url, result.paramUrl, result.title);
      }
    }, fail);

    // 回退
    this.menuService.subscribeGoToBack().subscribe((res) => {
      this.goBack(res);
    }, fail);

    // 根据路径高亮菜单
    this.menuService
      .subscribeSetCurMenu()
      .subscribe(this.setCurMenuLight.bind(this), fail);
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
    timer(1 * 60 * 60 * 1000).subscribe(() => {
      const userName = LocalStorageUtil.getLogin().userName;
      if (userName) {
        this.getQuestionBanktoken(userName);
      }
    });
  }


  initBaseOpenTab(menuList: Menu[], link: string): boolean {
    let isOpenTab = false;
    for (const item of menuList) {
      // item.link.startsWith(link)
      if (this.menuService.isUrlEqMenu(item.link, link)) {
        item.realLink = link;
        this.addTab(item);
        isOpenTab = true;
      } else if (item.children && item.children.length > 0) {
        if (this.initBaseOpenTab(item.children, link)) {
          isOpenTab = true;
        }
      }
    }
    return isOpenTab;
  }

  mClick(menu) {
    let index = -1;
    for (let i = 0; i < this.tabs.length; i++) {
      const item = this.tabs[i];
      if (item.link === menu.link) {
        index = i;
        break;
      }
    }
    if (index < 0) {
      menu.realLink = menu.link;
      this.addTab(menu);
      this.storeMenus(this.tabs);
      this.tabChange(this.index);
    } else {
      this.index = index;
    }
  }

  closeTab(tab: Menu, event?, tabChange = true): boolean {
    if (event) {
      event.stopPropagation();
    }
    let index = -1;
    for (let i = 0; i < this.tabs.length; i++) {
      const item = this.tabs[i];
      if (item.link === tab.link) {
        index = i;
        break;
      }
    }
    if (index > -1) {
      this.tabs.splice(index, 1);
      this.storeMenus(this.tabs);
      this.delReuseRoute(tab.realLink);
      if (tabChange) {
        if (this.tabs.length > 0) {
          if (this.index === index) {
            const idx = index - 1;
            this.index = idx < 0 ? 0 : idx;
            this.tabChange(this.index);
          }
        } else {
          this.index = -1;
          this.router.navigateByUrl('/m/e/empty');
        }
      }
    }
    return false;
  }

  goBack(tabChange?) {
    this.closeTab(this.tabs[this.index], null, tabChange);
  }

  setCurMenuLight(path: string) {
    let index = -1;
    for (let i = 0; i < this.tabs.length; i++) {
      const item = this.tabs[i];
      const pureLink = this.getPureLink(item.link);
      if (pureLink !== '' && this.comparePath(pureLink, path)) {
        index = i;
        break;
      }
    }

    if (index < 0) {
      this.checkSelectMenu(this.menus, path);
    } else {
      this.index = index;
      this.checkSelectMenu(this.menus, path);
    }
  }

  getPureLink(link: string) {
    // "/m/scp/prepare-course/:id/:name/:courseId/:professionId/:status".replace(/\/:.+(\/)?/g, "")
    return link.replace(/\/:.+(\/)?/g, '');
  }

  comparePath(purePath: string, urlPath: string) {
    const pureArr = purePath.split('/');
    const urlArr = urlPath.split('?')[0].split('/');
    if (pureArr.length > urlArr.length) {
      return false;
    }
    let isOk = true;
    for (let i = 0; i < pureArr.length; i++) {
      if (pureArr[i] !== urlArr[i]) {
        isOk = false;
        break;
      }
    }
    return isOk;
  }

  goUrl(link: string, params: string, title?: string) {
    let index = -1;
    // console.log('url clcik', url + params, title);
    for (let i = 0; i < this.tabs.length; i++) {
      const item = this.tabs[i];
      const pureLink = this.getPureLink(item.link);
      if (pureLink !== '' && this.comparePath(pureLink, link)) {
        const nUrl = link + params;
        if (item.realLink !== nUrl) {
          const iUrl = item.realLink;
          item.realLink = link + params;
          this.delReuseRoute(iUrl);
        }
        if (title) {
          item.text = title;
        }
        index = i;
        break;
      }
    }
    if (index < 0) {
      this.menuService.getCurMenu(link).subscribe(
        (result) => {
          const curMenu: Menu = Object.assign({}, result);
          if (curMenu && curMenu != null) {
            curMenu.realLink = link + params;
            if (title) {
              curMenu.text = title;
            }
            this.addTab(curMenu);
            this.storeMenus(this.tabs);
            if (this.index === 0) {
              this.tabChange(this.index);
            }
          }
        },
        (error) => {
        }
      );
    } else {
      this.index = index;
    }
  }


  drop(event: CdkDragDrop<{ item: number; index: number }, any>) {
    const pre = event.previousContainer.data.index;
    const current = event.container.data.index;
    if (pre === current) {
      return;
    }
    const tab = JSON.parse(JSON.stringify(this.tabs));
    moveItemInArray(tab, pre, current);
    this.tabs = tab;
    this.storeMenus(this.tabs);
    if (this.index === pre) {
      this.index = event.container.data.index;
    } else {
      if (this.index > event.previousContainer.data.index && this.index <= event.container.data.index) {
        this.index--;
      } else if (this.index < event.previousContainer.data.index && this.index >= event.container.data.index) {
        this.index++;
      }
    }
  }

  addTab(menu: Menu) {
    // 在单签页面
    const idx = this.index === -1 ? 0 : this.index + 1;
    this.tabs.splice(idx, 0, menu);
    this.index = idx;
  }

  storeMenus(menus: Menu[]) {
    SessionStorageUtil.putMenus(menus);
  }

  restoreMenus(): Menu[] {
    return SessionStorageUtil.getMenus();
  }

  tabChange(index: number) {
    const tab = this.tabs[index];
    if (tab && tab.link) {
      this.router.navigateByUrl(tab.realLink);
    }
    this.checkSelectMenu(this.menus, tab.link);
  }

  checkSelectMenu(menuList: Menu[], link: string): boolean {
    let isInTMenu = false;
    for (const item of menuList) {
      const pureLink = this.getPureLink(item.link);
      // 松散对比，严格对比使用 comparePath
      if (pureLink !== '' && link.startsWith(pureLink)) {
        item.isSelected = true;
        isInTMenu = true;
      } else if (item.children && item.children.length > 0) {
        if (this.checkSelectMenu(item.children, link)) {
          // 不是折叠的时候，才设置
          if (!this.isCollapsed) {
            item.isOpen = true;
          }
        }
      } else {
        item.isSelected = false;
      }
    }
    return isInTMenu;
  }

  /**
   * 对比头两个路由，如果相等就认为是子路由
   */
  compareFirstTwo(menuLink: string, link: string) {
    if (!menuLink.includes('/:')) {
      return false;
    }
    const menuLinkArr = menuLink.split('/');
    const linkArr = link.split('/');
    if (menuLinkArr.length < 3 || linkArr.length < 3) {
      return false;
    }
    if (menuLinkArr[1] === linkArr[1] && menuLinkArr[2] === linkArr[2]) {
      return true;
    } else {
      return false;
    }
  }

  loginOut() {
    LocalStorageUtil.removeTkToken();
    LocalStorageUtil.removeUser();
    SessionStorageUtil.clear();
    this.menuService.clear();
    this.delReuseRoute('', true);
    this.router.navigateByUrl('/p/login');
  }

  resetPwd() {
    this.menuService.gotoUrl({
      url: '/m/system/admin-security',
      paramUrl: '',
      title: '修改密码',
    });
  }

  delReuseRoute(path: string, isAll: boolean = false) {
    if (isAll) {
      AtrReuseStrategy.deleteAll();
    } else {
      AtrReuseStrategy.deleteRouteSnapshot(path);
    }
  }


  contextmenu(e, index) {
    this.currentTabIndex = index;
    const oX = e.clientX;
    const oY = e.clientY;
    this.renderer2.setStyle(this.menu.nativeElement, 'display', 'block');
    this.renderer2.setStyle(this.menu.nativeElement, 'left', oX + 'px');
    this.renderer2.setStyle(this.menu.nativeElement, 'top', oY + 'px');
    this.listen = this.renderer2.listen(this.doc, 'click', (event: Event) => {
      if (this.listen) {
        this.listen();
      }
      event.stopPropagation();
      this.renderer2.setStyle(this.menu.nativeElement, 'display', 'none');
      return false;
    });
    e.stopPropagation();
    return false;
  }


  closeTabs(limit?) {
    const tabs = [];
    switch (limit) {
      case 'other' :
        if (this.tabs.length === 1) {
          return;
        }
        this.tabs.forEach((e, i) => {
          if (i !== this.currentTabIndex) {
            this.delReuseRoute(e.realLink);
          }
        });
        this.tabs = [this.tabs[this.currentTabIndex]];
        if (this.index !== this.currentTabIndex) {
          this.router.navigateByUrl(this.tabs[0].realLink);
          this.checkSelectMenu(this.menus, this.tabs[0].link);
        }
        break;
      case 'left' :
        if (this.currentTabIndex === 0) {
          return;
        }
        this.tabs.forEach((e, i) => {
          if (i < this.currentTabIndex) {
            this.delReuseRoute(e.realLink);
          } else {
            tabs.push(e);
          }
        });
        if (this.index < this.currentTabIndex) {
          this.router.navigateByUrl(this.tabs[this.currentTabIndex].realLink);
          this.checkSelectMenu(this.menus, this.tabs[this.currentTabIndex].link);
        }
        this.tabs = tabs;
        break;
      case 'right' :
        if (this.currentTabIndex === this.tabs.length - 1) {
          return;
        }
        this.tabs.forEach((e, i) => {
          if (i > this.currentTabIndex) {
            this.delReuseRoute(e.realLink);
          } else {
            tabs.push(e);
          }
        });
        if (this.index > this.currentTabIndex) {
          this.router.navigateByUrl(this.tabs[this.currentTabIndex].realLink);
          this.checkSelectMenu(this.menus, this.tabs[this.currentTabIndex].link);
        }
        this.tabs = tabs;
        break;
      default :
        this.tabs.forEach((e, i) => {
          this.delReuseRoute(e.realLink);
        });
        this.tabs = [];
    }
    this.storeMenus(this.tabs);
    this.renderer2.setStyle(this.menu.nativeElement, 'display', 'none');
    if (!limit) {
      this.index = -1;
      this.router.navigateByUrl('/m/e/empty');
    }
  }
}
