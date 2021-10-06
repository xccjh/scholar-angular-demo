import {
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  RouteReuseStrategy
} from '@angular/router';
import {ComponentRef} from '@angular/core';
import {Injectable} from '@angular/core';

// solution: https://github.com/angular/angular/issues/25521
export interface DetachedRouteHandleExt extends DetachedRouteHandle {
  componentRef: ComponentRef<any>;
}

export interface RouteCacheRecord {
  handle: DetachedRouteHandleExt;
  /**
   * For unclear reasons, when the navigation starts, "retrieve" is called
   * without calling "shouldAttach" first (from "createRouterState").
   * This flag is used to ignore those calls. :-
   */
  shouldAttachCalled: boolean;
}

@Injectable()
export class AtrReuseStrategy implements RouteReuseStrategy {

  private static routeCache = new Map<string, RouteCacheRecord>();
  // public static outReusePath: string[] = ['_p', '_p_login'];
  public static ReusePath: string[] = [
    '_m_course-manage_course-list',
    '_m_course-manage_profession-list',
    '_m_course-manage_i-initiated',
    '_m_course-manage_approve-all',
    '_m_rm_read',
    '_m_rm_case',
    '_m_rm_setting',
    '_m_rm_train',
    '_m_course-manage_scp-list',
    '_m_course-manage_initiatepkg',
    '_m_course-manage_iapproved',
    '_m_course-manage_series-management',
    '_m_course-manage-statistics'
  ];

  public static deleteAll(): void {
    for (const key of AtrReuseStrategy.routeCache.keys()) {
      const routeCache = AtrReuseStrategy.routeCache.get(key);
      if (routeCache && routeCache.handle) {
        routeCache.handle.componentRef.destroy();
      }
      AtrReuseStrategy.routeCache.delete(key);
    }
  }

  public static deleteRouteSnapshot(path: string): void {
    const key = encodeURI(path.replace(/\//g, '_'));
    const routeCache = AtrReuseStrategy.routeCache.get(key);
    if (routeCache) {
      if (routeCache && routeCache.handle) {
        routeCache.handle.componentRef.destroy();
      }
      AtrReuseStrategy.routeCache.delete(key);
    } else {
      AtrReuseStrategy.routeCache.set(key, null);
    }
    // console.log(`route cache length: ${AtrReuseStrategy.routeCache.size}`);
    // for (const key1 of AtrReuseStrategy.routeCache.keys()) {
    //   console.log(key1);
    // }
  }

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    const key = this.getSnapshotKey(route);
    const del = AtrReuseStrategy.routeCache.has(key) && AtrReuseStrategy.routeCache.get(key) === null;
    const shouldDetach = !this.isToBeIgnored(route, 'shouldDetach') && !del;
    return shouldDetach;
  }

  store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandleExt | null): void {
    if (!detachedTree || this.isToBeIgnored(route, 'store')) {
      return;
    }
    const key = this.getSnapshotKey(route);
    // const previousStored = AtrReuseStrategy.routeCache.get(key);
    // if (previousStored) {
    //     if (!(previousStored.handle.componentRef === detachedTree.componentRef)) {
    //         previousStored.handle.componentRef.destroy();
    //     }
    // }

    AtrReuseStrategy.routeCache.set(key, {
      handle: detachedTree,
      shouldAttachCalled: false
    });

    if (detachedTree) {
      this.callHook(detachedTree, 'ngOnDetach');
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const key = this.getSnapshotKey(route);
    const stored = AtrReuseStrategy.routeCache.get(key);
    const destroyed = !!(
      stored && stored.handle.componentRef.hostView.destroyed
    );
    const msgStatus = destroyed ? 'DESTROYED' : stored ? 'FOUND' : 'NOT FOUND';
    const shouldAttach =
      !destroyed && !!stored && !this.isToBeIgnored(route, 'shouldAttach');
    if (shouldAttach) {
      stored.shouldAttachCalled = true;
    }
    return shouldAttach;
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandleExt | null {
    const key = this.getSnapshotKey(route);
    const stored = AtrReuseStrategy.routeCache.get(key);
    const destroyed = !!(
      stored && stored.handle.componentRef.hostView.destroyed
    );
    const shouldBeRetrieved =
      !destroyed && !!stored && stored.shouldAttachCalled;

    if (destroyed) {
      AtrReuseStrategy.routeCache.delete(key);
    }

    if (shouldBeRetrieved) {
      stored.shouldAttachCalled = false;
      if (this.isToBeIgnored(route, 'retrieve')) {
        return null;
      }
      const detachedTree = stored.handle;
      this.callHook(detachedTree, 'ngOnAttach');
      return detachedTree;
    }

    if (this.isToBeIgnored(route, 'pre-retrieve')) {
      return null;
    }

    return stored ? stored.handle : null;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    const result = future.routeConfig === curr.routeConfig; // from DefaultRouteReuseStrategy
    return result;
  }

  private getSnapshotKey(snapshot: ActivatedRouteSnapshot): string {
    // return snapshot.pathFromRoot.join('->');
    return snapshot['_routerState'].url.replace(/\//g, '_');
  }

  private isToBeIgnored(route: ActivatedRouteSnapshot, msg: string) {
    if (!route.routeConfig) {
      return true;
    }

    if (route.routeConfig.loadChildren) {
      return true;
    }

    if (route.children.length) {
      return true;
    }
    //
    // if (AtrReuseStrategy.outReusePath.indexOf(encodeURI(route['_routerState'].url.replace(/\//g, '_'))) > -1) {
    //   return true;
    // }

    if (AtrReuseStrategy.ReusePath.indexOf(encodeURI(route['_routerState'].url.replace(/\//g, '_'))) < 0) {
      return true;
    }


    return false;
  }

  private callHook(detachedTree: DetachedRouteHandleExt, hookName: string): void {
    const componentRef = detachedTree.componentRef;
    if (
      componentRef &&
      componentRef.instance &&
      typeof componentRef.instance[hookName] === 'function'
    ) {
      componentRef.instance[hookName]();
    }
  }
}
