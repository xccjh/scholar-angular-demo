import {Component, Inject, LOCALE_ID, TemplateRef, ViewChild} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NzModalRef, NzModalService} from 'ng-zorro-antd';
import {MenuService} from 'core/services/menu.service';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {spaceValidator} from 'src/app/shared/validators/atr-validtors';
import {ToolsUtil} from 'core/utils/tools.util';
import {SearchTableComponent} from '../components';
import {APPROVE_MAP, PAGE_CONSTANT} from 'core/base/static-data';
import {ConfirmableFlat} from 'core/decorators';
import {AreaZkDataType, CourseListDataType, NewMajorTypeParams} from 'core/base/common';
import {KnowledgeManageService} from '@app/busi-services';
import {LoadingControl} from 'core/base/common';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';


@Component({
  selector: 'app-package-overview',
  templateUrl: './package-overview.component.html',
  styleUrls: ['./package-overview.component.less'],
})
export class PackageOverviewComponent extends SearchTableComponent {
  _PAGE_ID_ = 'PackageOverviewComponent';
  type: '0' | '1' | '2' = '0';
  orderJy = null;
  orderRw = null;
  orderZl = null;


  constructor(
    private fb: FormBuilder,
    private modalService: NzModalService,
    private knowledgeManageService: KnowledgeManageService,
    private menuService: MenuService,
    public message: NzMessageService,
    @Inject(LOCALE_ID) public locale: string
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
      url: '/m/course-manage/scp-list',
      paramUrl: '',
      title: '课包'
    });
  }


  changeType(type: '0' | '1' | '2') {
    this.type = type;
  }


  nzSortOtrderChangeJy($event: string | 'ascend' | 'descend') {

  }
  nzSortOtrderChangeRw($event: string | 'ascend' | 'descend') {

  }

  nzSortOtrderChangeZl($event: string | 'ascend' | 'descend') {

  }
}
