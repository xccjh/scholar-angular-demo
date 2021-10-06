import {Injectable, Injector} from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpResponseBase,
  HttpResponse
} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {mergeMap, catchError} from 'rxjs/operators';

import {environment} from 'src/environments/environment';

import {NzNotificationService} from 'ng-zorro-antd';
import {NzMessageService} from 'ng-zorro-antd/message';
import {Router} from '@angular/router';
import {LocalStorageUtil} from '../utils/localstorage.util';
import {MenuService} from 'core/services/menu.service';
import {AtrReuseStrategy} from '../routereuse/atr-reuse-strategy';

const CODEMESSAGE = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

@Injectable()
export class BaseInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) {
  }

  private get msg(): NzMessageService {
    return this.injector.get(NzMessageService);
  }

  private get notification(): NzNotificationService {
    return this.injector.get(NzNotificationService);
  }

  private get menuService(): MenuService {
    return this.injector.get(MenuService);
  }

  private goTo(url: string, isClearCache: boolean) {
    console.log('需要跳转到页面：');
    console.log(url);
    setTimeout(() => this.injector.get(Router).navigateByUrl(url));
    if (isClearCache) {
      setTimeout(() => AtrReuseStrategy.deleteAll(), 50);
    }
  }

  private checkStatus(ev: HttpResponseBase) {
    if ((ev.status >= 200 && ev.status < 300) || ev.status === 401) {
      return;
    }
    console.log(ev.status);
    const errortext = CODEMESSAGE[ev.status] || ev.statusText;
    this.notification.error(`请求错误 ${ev.status}:`, errortext);
  }

  private handleData(ev: HttpResponseBase, req: HttpRequest<any>): Observable<any> {
    this.checkStatus(ev);
    // 业务处理：一些通用操作
    switch (ev.status) {
      case 200:
        // TODO status
        // 业务层级错误处理，以下是假定restful有一套统一输出格式（指不管成功与否都有相应的数据格式）情况下进行处理
        // 例如响应内容：
        //  错误内容：{ status: 1, msg: '非法参数' }
        //  正确内容：{ status: 0, response: {  } }
        // 则以下代码片断可直接适用
        if (ev instanceof HttpResponse) {
          const body: any = ev.body;
          if (body && body.status === 401) {
            this.notification.error(`未登录或登录已过期，请重新登录。`, ``, {
              nzKey: 'outTime'
            });
            // TODO 清空 token 信息
            LocalStorageUtil.removeUser();
            this.menuService.clear();
            this.goTo('/p/login', true);
          } else if (body && body.status === 1024) {
            // 或者依然保持完整的格式
            this.notification.error(body.message, ``, {
              nzKey: 'exception'
            });
          } else if (body && body.status === 1025) {
            // 或者依然保持完整的格式
            this.msg.error(`参数为空。`);
          } else if (body && body.status === 503) {
            // 或者依然保持完整的格式
            this.msg.error(body.message);
          } else if (body && body.status === 204) {
            // 或者依然保持完整的格式
            this.msg.success(body.message);
          } else if (body && body.status === 201) {
            if (req.url === (environment.SERVER_URL + 'res/knowledge-point/save')) {
              this.msg.success('自动保存修改成功');
            } else {
              // 或者依然保持完整的格式
              this.msg.success(body.message);
            }
          } else {
            return of(ev);
          }
        }
        break;
      case 401:
        this.notification.error(`未登录或登录已过期，请重新登录。`, ``, {
          nzKey: 'outTime'
        });
        // TODO 清空 token 信息

        // this.goTo('/p/login',false);
        break;
      case 403:
      case 404:
      case 500:
        this.notification.error(`请求出错，status：${ev.status}`, ``, {
          nzKey: 'outTime'
        });
        // this.goTo(`/exception/${ev.status}`, false);
        throwError(ev);
        break;
      default:
        if (ev instanceof HttpErrorResponse) {
          console.warn('未可知错误，大部分是由于后端不支持CORS或无效配置引起', ev);
          return throwError(ev);
        }
        break;
    }
    return of(ev);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 统一加上服务端前缀
    let url = req.url;
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      url = environment.SERVER_URL + url;
      req = req.clone({url});
    }
    return next.handle(req).pipe(
      mergeMap((event: any) => {
        // 允许统一对请求错误处理
        if (event instanceof HttpResponseBase) {
          return this.handleData(event, req);
        }
        // 若一切都正常，则后续操作
        return of(event);
      }),
      catchError((err: HttpErrorResponse) => this.handleData(err, req)),
    );
  }
}
