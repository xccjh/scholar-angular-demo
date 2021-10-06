import {Inject, Injectable, LOCALE_ID, ViewChild} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {forkJoin, Observable} from 'rxjs';
import {first} from 'rxjs/internal/operators';
import {CommonPagination, CourseListDataType, CourseListParams} from 'core/base/common';
import {PAGE_CONSTANT} from 'core/base/static-data';
import {CourseManageService} from '@app/busi-services';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {formatDate} from '@angular/common';
import {IInitiatedComponent} from './i-initiated/i-initiated.component';
import {ApproveAllComponent} from './approve-all/approve-all.component';
import {CourseListComponent} from './course-list/course-list.component';
import {ToolsUtil} from 'core/utils/tools.util';


@Injectable()
export class CourseListResolverService implements Resolve<[CommonPagination<CourseListDataType>]> {
  @ViewChild(IInitiatedComponent) iinitiatedcomponent: any;
  @ViewChild(ApproveAllComponent) approveallcomponent: any;
  @ViewChild(CourseListComponent) courselistcomponent: any;

  constructor(
    private courseMgService: CourseManageService,
    private router: Router,
    @Inject(LOCALE_ID) public locale: string,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot,
          state: RouterStateSnapshot
  ): Observable<[CommonPagination<CourseListDataType>]> | null | Observable<any> {
    // const flag = window.location.hash === ('#' + state.url);
    const params: CourseListParams = this.getParams(route);
    const work = [this.courseMgService.getCourseListNew(params)];
    // if (flag) {
    //   work.push(of(null));
    // }
    return forkJoin(work).pipe(first());
  }

  mergeParams(param1, param2, audit ?) {
    if (param1.searchWordVal || param1?.dateRangeVal?.length || param1.selectedVal) {
      const obj: any = {
        searchKey: param1.searchWordVal,
        startTime: param1.dateRangeVal.length ? formatDate(param1.dateRangeVal[0], 'yyyy-MM-dd', this.locale) : '',
        endTime: param1.dateRangeVal.length ? formatDate(param1.dateRangeVal[1], 'yyyy-MM-dd', this.locale) : '',
      };
      if (!audit) {
        obj.auditStatus = param1.selectedVal;
      }
      return {...obj, ...param2};
    }
    return param2;
  }

  setpageInfo(param, label) {
    const pageInfo = sessionStorage.getItem(label);
    if (pageInfo) {
      param.page = JSON.parse(pageInfo).page;
      param.limit = JSON.parse(pageInfo).limit;
    } else {
      param.page = PAGE_CONSTANT.page;
      param.limit = PAGE_CONSTANT.limit;
    }
  }

  getParams(route) {
    const param: CourseListParams = JSON.parse(JSON.stringify(PAGE_CONSTANT));
    param.filterKey = 'MANAGER';
    switch (route.routeConfig.path) {
      case 'i-initiated':
        param.queryFilterType = 'I_STARTED';
        this.setpageInfo(param, 'SCHOLAR_IInitiatedComponentPageInfo' + ToolsUtil.getOrgCode());
        return this.mergeParams(SessionStorageUtil.getSearch('IInitiatedComponent'), param);
      case 'approve-all':
        param.queryFilterType = 'ALL_APPROVED';
        this.setpageInfo(param, 'SCHOLAR_ApproveAllComponentPageInfo' + ToolsUtil.getOrgCode());
        return this.mergeParams(SessionStorageUtil.getSearch('ApproveAllComponent'), param, true);
      default:
        this.setpageInfo(param, 'SCHOLAR_CourseListComponentPageInfo' + ToolsUtil.getOrgCode());
        return this.mergeParams(SessionStorageUtil.getSearch('CourseListComponent'), param);
    }
  }
}
