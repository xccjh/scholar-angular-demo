import {Component, Inject, LOCALE_ID, TemplateRef, ViewChild} from '@angular/core';
import {MenuService} from 'core/services/menu.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ToolsUtil} from 'core/utils/tools.util';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {SearchTableComponent} from '../components';
import {formatDate} from '@angular/common';
import {PacketInfo} from 'core/base/common';

@Component({
  selector: 'app-i-initiated-pkg',
  templateUrl: './initiatepkg.component.html',
  styleUrls: ['./initiatepkg.component.less']
})
export class InitiatepkgComponent extends SearchTableComponent {
  _PAGE_ID_ = 'InitiatepkgComponent';
  id = -1;
  modalForm: FormGroup;
  modalFormRef: NzModalRef;
  selectedVal = '1,2,3';
  selectedValue = '1,2,3';
  isVisible = false;
  visible = false;
  orgCode = ToolsUtil.getOrgCode();

  @ViewChild('modalContent') modalContent: TemplateRef<any>;

  constructor(
    private fb: FormBuilder,
    private modalService: NzModalService,
    private menuService: MenuService,
    public courseMgService: CourseManageService,
    public message: NzMessageService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    super();
  }


  /*
  * @Override
  * @*/
  getDataList(): void {
    this.isLoading = true;
    const param: any = {
      name: this.searchWord.trim(),
      auditStatus: this.selectedValue ? this.selectedValue : '1,2,3',
      createTimeStart: '',
      createTimeEnd: '',
      limit: this.pageSize,
      page: this.pageIndex,
      orgCode: this.orgCode,
      createrId: LocalStorageUtil.getUserId()
    };
    if (this.dateRange.length) {
      param.createTimeStart = formatDate(this.dateRange[0], 'yyyy-MM-dd', this.locale);
      param.createTimeEnd = formatDate(this.dateRange[1], 'yyyy-MM-dd', this.locale);
    }
    this.courseMgService.getPkgList(param).subscribe(res => {
      this.isLoading = false;
      if (res.status !== 200) {
        this.message.error(res.message);
        return;
      }
      this.data = res.data;
      this.total = res.page.totalResult;
    }, err => {
      this.isLoading = false;
      this.message.error(JSON.stringify(err));
    });
  }

  getStatus(status: any) {
    switch (status) {
      case '0':
        return '草稿';
      case '1':
        return '标准';
      default :
        return '未知';
    }
  }

  getAuditStatus(status: any) {
    switch (status) {
      case '0':
        return '草稿';
      case '1':
        return '待审批';
      case '2':
        return '已通过';
      case '3':
        return '未通过';
      case '4':
        return '撤回';
      default :
        return '未知';
    }
  }

  delIf(data: any) {
    return String(data.status) !== '99';
  }


  goPrepare(item: PacketInfo, preview?: boolean): void {
    SessionStorageUtil.putPacketInfo(item, preview);
    SessionStorageUtil.clearChapterSelection();
    this.menuService.gotoUrl({
      title: '课包预览',
      url: '/m/course-manage/prepare-course',
      paramUrl: '',
    });
  }


}
