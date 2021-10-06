import {Component, Inject, LOCALE_ID} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {CourseManageService} from '@app/busi-services';
import {SearchTableComponent} from '@app/routes/course-manage/components';
import {ActivatedRoute} from '@angular/router';
import {MenuService} from 'core/services/menu.service';
import {StatisticsLogService} from '@app/busi-services/statistics-log.service';
import {ToolsUtil} from 'core/utils/tools.util';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {STATISTICALRULES} from 'core/base/static-data';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';


@Component({
  selector: 'app-operation-log',
  templateUrl: './operation-log.component.html',
  styleUrls: ['./operation-log.component.less'],
})
export class OperationLogComponent extends SearchTableComponent {
  _PAGE_ID_ = 'OperationLogComponent';
  userInfo = LocalStorageUtil.getUser();

  constructor(
    private menuService: MenuService,
    public courseMgService: CourseManageService,
    public message: NzMessageService,
    public route: ActivatedRoute,
    private statisticsLogService: StatisticsLogService,
    @Inject(LOCALE_ID) public locale: string,
  ) {
    super();
  }


  /*
  * @Override
  * @*/
  getDataList(): void {
    this.statisticsLogService.packageOperatLog({
      current: this.pageIndex,
      size: this.pageSize,
      orgCode: ToolsUtil.getOrgCode(),
      informationId: this.route.snapshot.queryParams.pcode,
      source: 1,
      keyword: this.searchWord.trim(),
      userId: this.userInfo.id,
      businessCode: STATISTICALRULES.packetInfo.businessId,
    }).subscribe(res => {
      if (res.code === 200) {
        if (res.data && res.data.total) {
          this.data = res.data.records;
          this.total = res.data.total;
        } else {
          this.data = [];
          this.total = 0;
        }
      }
    });
  }

  goback() {
    this.menuService.goBack(false);
    this.menuService.gotoUrl({
      url: '/m/course-manage/scp-list',
      paramUrl: '',
      title: '课包'
    });
  }

}
