import {Component, Inject, LOCALE_ID, TemplateRef, ViewChild} from '@angular/core';
import {MenuService} from 'core/services/menu.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {FormGroup} from '@angular/forms';
import {ToolsUtil} from 'core/utils/tools.util';
import {ResolverDataComponent} from '../components';
import {ActivatedRoute} from '@angular/router';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';


@Component({
  selector: 'app-i-initiated',
  templateUrl: './i-initiated.component.html',
  styleUrls: ['./i-initiated.component.less']
})
export class IInitiatedComponent extends ResolverDataComponent {
  _PAGE_ID_ = 'IInitiatedComponent';
  id = -1;
  modalForm: FormGroup;
  modalFormRef: NzModalRef;
  isVisible = false;
  visible = false;
  orgCode = ToolsUtil.getOrgCode();
  @ViewChild('modalContent') modalContent: TemplateRef<any>;

  constructor(
    private modalService: NzModalService,
    private menuService: MenuService,
    public message: NzMessageService,
    public courseMgService: CourseManageService,
    public route: ActivatedRoute,
    @Inject(LOCALE_ID) public locale: string,
  ) {
    super(route);
  }

  preview(data: any): void {
    SessionStorageUtil.removeKnowledgeGraphTab(); // 菜单栏切换需要保留tab状态，预览入口不需要
    SessionStorageUtil.putCourseType('1');
    this.menuService.gotoUrl({url: '/m/course-manage/course-preview', paramUrl: `/${data.id}?type=my`});
  }
}
