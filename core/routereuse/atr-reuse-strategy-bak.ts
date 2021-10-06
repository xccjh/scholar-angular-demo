import { RouteReuseStrategy, DetachedRouteHandle, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class AtrReuseStrategy implements RouteReuseStrategy {

  public static handlers: { [key: string]: DetachedRouteHandle } = {};

  public static outReusePath: string[]  = ['_p', '_p_login', '_s', '_d', '_d_i'];

  public static deleteAll(): void {
    // console.log("删除所有缓存路由："+name)
    AtrReuseStrategy.handlers = {};
  }

  /** 删除缓存路由快照的方法 */
  public static deleteRouteSnapshot(path: string): void {
    const name = encodeURI(path.replace(/\//g, '_'));
    if (AtrReuseStrategy.handlers[name]) {
      delete AtrReuseStrategy.handlers[name];
    }
  }

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    const path = this.getRouteUrl(route);
    if (!route.routeConfig || route.routeConfig.loadChildren || AtrReuseStrategy.outReusePath.indexOf(path) > -1 ) {
    return false;
    } else {
    return true;
    }
  }
  /** 当路由离开时会触发。按path作为key存储路由快照&组件当前实例对象 */
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    const path = this.getRouteUrl(route);
    AtrReuseStrategy.handlers[path] = handle;
  }
    /** 若 path 在缓存中有的都认为允许还原路由 */
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return !!AtrReuseStrategy.handlers[this.getRouteUrl(route)];
  }
  /** 从缓存中获取快照，若无则返回nul */
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    if (!route.routeConfig) { return null; }
    if (route.routeConfig.loadChildren || route.routeConfig.children ) { return null; }
    const name = this.getRouteUrl(route);
    if (!AtrReuseStrategy.handlers[name]) {
        return null;
    }
    if (AtrReuseStrategy.outReusePath.indexOf(name) > -1 ) {
        console.log(name);
        return null;
    }
    return AtrReuseStrategy.handlers[name];
  }
  /** 进入路由触发，判断是否同一路由 */
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  /** 使用route的path作为快照的key */
  getRouteUrl(route: ActivatedRouteSnapshot) {
    const path = route['_routerState'].url.replace(/\//g, '_');
    return path;
  }
}
