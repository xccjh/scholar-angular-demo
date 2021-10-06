import {Component, Inject, LOCALE_ID} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {CourseManageService} from '@app/busi-services';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SearchTableComponent} from '@app/routes/course-manage/components';
import {ActivatedRoute} from '@angular/router';
import {MenuService} from 'core/services/menu.service';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {NzModalService} from 'ng-zorro-antd';


@Component({
  selector: 'app-graph-statistics',
  templateUrl: './graph-statistics.component.html',
  styleUrls: ['./graph-statistics.component.less'],
})
export class GraphStatisticsComponent extends SearchTableComponent {
  _PAGE_ID_ = 'GraphStatisticsComponent';
  historys = [];
  order = null;

  constructor(
    private menuService: MenuService,
    public courseMgService: CourseManageService,
    public message: NzMessageService,
    public route: ActivatedRoute,
    @Inject(LOCALE_ID) public locale: string,
  ) {
    super();
  }


  /*
  * @Override
  * @*/
  getDataList(): void {
    // return new Promise((resolve => {
    //   this.courseMgService.getCourseListTree().subscribe(res => {
    //     if (res.status === 200) {
    //       if (res.data.length) {
    //       } else {
    //       }
    //       resolve(true);
    //     } else {
    //       resolve(false);
    //     }
    //   }, () => {
    //     resolve(false);
    //   });
    // }));
  }

  goback() {
    this.menuService.goBack(false);
    this.menuService.gotoUrl({
      url: '/m/course-manage/course-list',
      paramUrl: '',
      title: '课程管理'
    });
  }

  export() {

  }

  nzSortOtrderChange($event: string | 'ascend' | 'descend') {

  }

  detail(data: any) {

  }
}
