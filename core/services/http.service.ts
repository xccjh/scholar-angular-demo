import {Injectable} from '@angular/core';
import {HttpClient, HttpRequest, HttpEventType, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {HttpOptions} from 'core/base/common';
import {LocalStorageUtil} from '../utils/localstorage.util';
import {ToolsUtil} from '../utils/tools.util';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private httpClient: HttpClient
  ) {
  }

  get originalHttpClient() {
    return this.httpClient;
  }

  postBody2 = (url: string, params?: {}, options?: HttpOptions, headers?: {}): Observable<any> => {

    return new Observable<any>(observe => {

      let reqHeaders = new HttpHeaders();
      if (options && options.hasOwnProperty('isCommonHttpHeader')) {
        reqHeaders = this.getDefaultHeader(reqHeaders);
      }
      let withCredentials = true;
      if (options && options.hasOwnProperty('isWithCredentials')) {
        withCredentials = options.isWithCredentials;
      }

      for (const key of Object.keys(params)) {
        if (params.hasOwnProperty(key) && typeof params[key] === 'object') {
          params[key] = JSON.stringify(params[key]);
        }
      }

      this.httpClient.post(url, params, {headers: reqHeaders, params: {}, withCredentials})
        .subscribe(result => {
          observe.next(result);
          observe.complete();
          observe.unsubscribe();
        }, error => {
          observe.error(error);
          observe.unsubscribe();
        });

    });
  }

  post = (url: string, params?: {}, options?: HttpOptions, headers?: {}): Observable<any> => {
    let reqHeaders = new HttpHeaders();
    if (options && options.hasOwnProperty('isCommonHttpHeader')) {
      reqHeaders = this.getDefaultHeader(reqHeaders);
    }

    let withCredentials = true;
    if (options && options.hasOwnProperty('isWithCredentials')) {
      withCredentials = options.isWithCredentials;
    }
    // params = { ...params, orgCode: ToolsUtil.getOrgCode(), orgId: this.getOrgIdByLocalStorage() };
    for (const key of Object.keys(params)) {
      if (params.hasOwnProperty(key) && typeof params[key] === 'object') {
        params[key] = JSON.stringify(params[key]);
      }
    }
    let body = null;
    let opts = null;
    if (options && options.isBody) {
      body = params;
      opts = {headers: reqHeaders, withCredentials};
    } else {
      opts = {headers: reqHeaders, params, withCredentials};
    }
    return this.httpClient.post(url, body, opts);
  }

  postBody = (url: string, params?: {}, options?: HttpOptions, headers?: {}): Observable<any> => {
    let reqHeaders = new HttpHeaders();
    if (options && options.hasOwnProperty('isCommonHttpHeader')) {
      reqHeaders = this.getDefaultHeader(reqHeaders);
    }

    let withCredentials = true;
    if (options && options.hasOwnProperty('isWithCredentials')) {
      withCredentials = options.isWithCredentials;
    }
    return this.httpClient.post(url, params, {headers: reqHeaders, params: {}, withCredentials});
  }

  putBody = (url: string, params?: {}, options?: HttpOptions, headers?: {}): Observable<any> => {
    let reqHeaders = new HttpHeaders();
    if (options && options.hasOwnProperty('isCommonHttpHeader')) {
      reqHeaders = this.getDefaultHeader(reqHeaders);
    }

    let withCredentials = true;
    if (options && options.hasOwnProperty('isWithCredentials')) {
      withCredentials = options.isWithCredentials;
    }
    return this.httpClient.put(url, params, {headers: reqHeaders, params: {}, withCredentials});
  }
  /**
   * body有stringify的
   */
  postBodyWithStringify = (url: string, params?: {}, options?: HttpOptions, headers?: {}): Observable<any> => {
    return new Observable<any>(observe => {
      let reqHeaders = new HttpHeaders();
      if (options && options.hasOwnProperty('isCommonHttpHeader')) {
        reqHeaders = this.getDefaultHeader(reqHeaders);
      }

      let withCredentials = true;
      if (options && options.hasOwnProperty('isWithCredentials')) {
        withCredentials = options.isWithCredentials;
      }
      for (const key of Object.keys(params)) {
        if (params.hasOwnProperty(key) && typeof params[key] === 'object') {
          params[key] = JSON.stringify(params[key]);
        }
      }

      this.httpClient.post(url, params, {headers: reqHeaders, params: {}, withCredentials})
        .subscribe(result => {
          observe.next(result);
          observe.complete();
          observe.unsubscribe();
        }, error => {
          observe.error(error);
          observe.unsubscribe();
        });

    });
  }

  // tslint:disable-next-line:variable-name
  getDefaultHeader(_headers: HttpHeaders): HttpHeaders {
    _headers = _headers.set('x-header-atr', 'manage');
    _headers = _headers.set('token', LocalStorageUtil.getUserToken());
    _headers = _headers.set('userId', LocalStorageUtil.getUserId());
    _headers = _headers.set('orgCode', ToolsUtil.getOrgCode());
    _headers = _headers.set('stuId', LocalStorageUtil.getUserId());
    return _headers;
  }

  get = (url: string, params?: {}, options?: HttpOptions): Observable<any> => {
    let reqHeaders = new HttpHeaders();
    if (options && options.hasOwnProperty('isCommonHttpHeader')) {
      reqHeaders = this.getDefaultHeader(reqHeaders);
    }
    let withCredentials = false;
    if (options && options.hasOwnProperty('isWithCredentials')) {
      withCredentials = options.isWithCredentials;
    }
    const opts: any = {headers: reqHeaders, params, withCredentials};
    if (options && options.hasOwnProperty('isFile')) {
      opts.responseType = 'blob';
    }
    if (options && options.hasOwnProperty('isObserve')) {
      opts.observe = 'response';
    }
    return this.httpClient.get(url, opts);
  }
  upload = (method, url, formData: FormData, progress: any): Observable<any> => {
    const req = new HttpRequest(method, url, formData, {reportProgress: true});
    return new Observable(observe => {
      this.httpClient.request(req).subscribe((event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          if (typeof progress === 'function') {
            event.progress = parseInt(event.loaded / event.total * 100 + '', 10);
            progress(event);
          }
        }
        if (event.type === HttpEventType.Response) {
          observe.next(event.body);
        }
      }, error => {
        observe.error(error);
        observe.unsubscribe();
      });
    });
  }

  private transformString = (objItem) => {
    const list = [];
    // tslint:disable-next-line:forin
    for (const key in objItem) {
      let str = '';
      const item = objItem[key];
      if (item instanceof Array) {
        // 数组
        const arr = [];
        item.forEach((v, k) => {
          const s = encodeURIComponent(key) + '[' + k + ']';
          arr.push(this.parseObj(v, s));
        });
        str = arr.join('&');
      } else if (item instanceof Object) {
        // json
        const arr = [];
        // tslint:disable-next-line:forin
        for (const k in item) {
          const v = item[k];
          const s = encodeURIComponent(key) + '.' + encodeURIComponent(k);
          arr.push(this.parseObj(v, s));
        }
        str = arr.join('&');
      } else {
        // 普通类型
        str = encodeURIComponent(key) + '=' + encodeURIComponent(item);
      }
      list.push(str);
    }
    return list.join('&');
  }

  private parseObj = (obj, str) => {
    if (obj instanceof Array) {
      // 数组
      const arr = [];
      obj.forEach((v, k) => {
        const s = str + '[' + k + ']' + '=' + encodeURIComponent(v);
        arr.push(this.parseObj(v, s));
      });
      str = arr.join('&');
    } else if (obj instanceof Object) {
      // json
      const arr = [];
      // tslint:disable-next-line:forin
      for (const k in obj) {
        const v = obj[k];
        const s = str + '.' + encodeURIComponent(k);
        arr.push(this.parseObj(v, s));
      }
      str = arr.join('&');
    } else {
      // 普通类型
      str = str + '=' + encodeURIComponent(obj);
    }
    return str;
  }
}


