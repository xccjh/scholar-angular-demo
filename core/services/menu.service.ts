import {EventEmitter, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Menu} from 'core/base/menus';
import {HttpService} from './http.service';


@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private data: Menu[] = [];
  private menuChange: EventEmitter<Menu[]>; // 发送菜单数据
  private urlChange: EventEmitter<any>; // 路由跳转
  private goToBack: EventEmitter<any>; // 回退
  private setCurMenu: EventEmitter<any>; // 根据url亮起当前菜单
  private menuUrl: string;
  private isLoadMenu: 'unload' | 'loading' | 'loaded' = 'unload';

  // private Menu
  constructor(private httpService: HttpService) {
    this.menuChange = new EventEmitter();
    this.urlChange = new EventEmitter();
    this.goToBack = new EventEmitter();
    this.setCurMenu = new EventEmitter();
  }

  getUrlChange(): any {
    return this.urlChange;
  }

  subscribeGoToBack() {
    return this.goToBack;
  }

  subscribeSetCurMenu() {
    return this.setCurMenu;
  }

  gotoUrl(routeParam: { url: string; paramUrl: string; title?: string }) {
    this.urlChange.emit(routeParam);
  }

  goBack(tabChange = true) {
    this.goToBack.emit(tabChange);
  }

  setCurUrlTab(path) {
    // 根据当前url亮起菜单
    this.setCurMenu.emit(path);
  }

  setMenuUrl(menUrl: string) {
    // 设置菜单请求路径
    this.menuUrl = menUrl;
  }

  getCurMenu(url: string): Observable<Menu> {
    return new Observable<any>((observe) => {
      if (this.isLoadMenu === 'loaded') {
        observe.next(this.getMenuByUrl(this.data, url));
        observe.unsubscribe();
      } else {
        this.loadMenus().subscribe(
          (result) => {
            observe.next(this.getMenuByUrl(this.data, url));
            observe.unsubscribe();
          },
          (error) => {
            console.log(error);
          }
        );
      }
    });
  }

  getMenuByUrl(menus: Menu[], url: string): Menu {
    let tempMenu: Menu = null;
    for (const menu of menus) {
      // this.isLoadUrlEqMenu(menu.link , url)
      if (this.getPureLink(menu.link) === url) {
        tempMenu = menu;
        break;
      } else if (menu.children && menu.children.length > 0) {
        if (this.getMenuByUrl(menu.children, url) != null) {
          tempMenu = this.getMenuByUrl(menu.children, url);
          break;
        }
      }
    }
    return tempMenu;
  }

  getPureLink(link: string) {
    // "/m/scp/prepare-course/:id/:name/:courseId/:professionId/:status".replace(/\/:.+(\/)?/g, "")
    return link.replace(/\/:.+(\/)?/g, '');
  }

  loadMenus(): Observable<any> {
    return new Observable<any>((observe) => {
      if (this.isLoadMenu === 'unload') {
        this.isLoadMenu = 'loading';
        const options = {
          isCommonHttpHeader: true,
        };
        this.httpService
          .post(this.menuUrl, {platformId: window['__platform__']}, options)
          .subscribe(
            (result) => {
              if (result.status === 200) {
                this.isLoadMenu = 'loaded';
                this.data = result.data;
              } else {
                this.isLoadMenu = 'unload';
                this.data = [];
              }
              observe.next(this.data);
              this.menuChange.emit(this.data);
              observe.complete();
              observe.unsubscribe();
            },
            (error) => {
              observe.error(error);
              observe.unsubscribe();
            }
          );
      } else if (this.isLoadMenu === 'loading') {
        this.menuChange.subscribe((menus: Menu[]) => {
          observe.next(menus);
          observe.complete();
          observe.unsubscribe();
        });
      } else {
        observe.next(this.data);
        observe.complete();
        observe.unsubscribe();
      }
    });
  }

  isLoadUrlEqMenu(menuUrl: string, url: string): boolean {
    let isTrue = false;
    if (menuUrl.indexOf('/:id') > -1) {
      const menuUrls = menuUrl.split('/:id');
      if (url.indexOf(menuUrls[0]) === 0) {
        if (menuUrl.split('/').length === url.split('/').length) {
          isTrue = true;
        }
      }
    } else if (menuUrl === url) {
      isTrue = true;
    }
    return isTrue;
  }

  isUrlEqMenu(menuUrl: string, url: string): boolean {
    if (menuUrl === '') {
      return false;
    }

    let originMenuUrl = this.getNoParamUrl(menuUrl);
    const originUrl = this.getNoParamUrl(url);

    if (originMenuUrl === originUrl) {
      return true;
    } else if (originMenuUrl.length < originUrl.length) {
      if (originMenuUrl[originMenuUrl.length - 1] !== '/') {
        originMenuUrl += '/';
      }
      if (originUrl.startsWith(originMenuUrl)) {
        return true;
      }
    }

    return false;
  }

  getNoParamUrl(str: string): string {
    const idx = str.indexOf('/:');
    return idx === -1 ? str : str.substr(0, idx + 1);
  }

  filterRouterByMenus(routes) {
    console.log(routes, this.data);
  }

  /**
   * 清空菜单
   */
  clear() {
    this.isLoadMenu = 'unload';
    this.data = [];
  }
}
