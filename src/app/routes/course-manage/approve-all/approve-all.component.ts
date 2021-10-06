import {Component, Inject, LOCALE_ID, TemplateRef, ViewChild} from '@angular/core';
import {MenuService} from 'core/services/menu.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {NotifyService} from 'core/services/notify.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ToolsUtil} from 'core/utils/tools.util';
import {KnowledgeManageService} from '../../../busi-services/knowledge-manag.service';
import {ResolverDataComponent} from '../components';
import {APPROVE_MAP} from 'core/base/static-data';
import {ActivatedRoute} from '@angular/router';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {ConfirmableFlat} from 'core/decorators';


@Component({
  selector: 'app-approve-all',
  templateUrl: './approve-all.component.html',
  styleUrls: ['./approve-all.component.less']
})
export class ApproveAllComponent extends ResolverDataComponent {
  _PAGE_ID_ = 'ApproveAllComponent';
  id = -1;
  modalForm: FormGroup;
  modalFormRef: NzModalRef;
  isVisible = false;
  visible = false;
  orgCode = ToolsUtil.getOrgCode();
  currentItem: any;
  fg: FormGroup;
  indeterminate = false;
  checked = false;
  loading = false;
  listOfCurrentPageData: ReadonlyArray<any> = [];
  setOfCheckedId = new Set<number>();
  addKnowledgePoints = 0;
  delKnowledgePoints = 0;
  approveLoading: any;
  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  @ViewChild('tips') tips: TemplateRef<any>;

  constructor(
    private fb: FormBuilder,
    private modalService: NzModalService,
    private menuService: MenuService,
    private notify: NotifyService,
    private knowledgeManageService: KnowledgeManageService,
    public courseMgService: CourseManageService,
    public message: NzMessageService,
    public route: ActivatedRoute,
    @Inject(LOCALE_ID) public locale: string,
  ) {
    super(route);
  }

  preview(data: any): void {
    SessionStorageUtil.removeKnowledgeGraphTab(); // 菜单栏切换需要保留tab状态，预览入口不需要
    SessionStorageUtil.putCourseType('2');
    this.menuService.gotoUrl({url: '/m/course-manage/course-preview', paramUrl: `/${data.id}?type=all`});
  }

  approveAll(data, type) {
    const param = {
      courseId: data.id,
      action: APPROVE_MAP[type]
    };
    this.approveLoading = true;
    this.knowledgeManageService.approveAll(param).subscribe(res => {
      this.approveLoading = false;
      if (res.status === 201) {
        this.modalFormRef.destroy();
        this.searchData();
      }
    }, () => {
      this.approveLoading = false;
    });
  }

  /**
   * @overide
   */
  searchData(reset: boolean | string = false) {
    super.searchData(reset);
    this.checked = false;
    this.indeterminate = false;
    this.listOfCurrentPageData = [];
    this.setOfCheckedId = new Set<number>();
  }


  approved(data: any) {
    if (data.status === '1') {
      this.knowledgeManageService.getDetailApprove(data.knowledgeSubjectId).subscribe(res => {
        this.addKnowledgePoints = res.new;
        this.delKnowledgePoints = res.del;
        this.approvedReal(data);
      });
    } else {
      this.approvedReal(data);
    }
  }

  approvedReal(data: any) {
    this.currentItem = data;
    this.modalFormRef = this.modalService.create({
      nzTitle: (data.status === '0' ? '课程审批 - ' : '知识图谱审批 - ') + data.name,
      nzContent: this.tips,
      nzMaskClosable: false,
      nzWrapClassName: 'vertical-center-modal',
      nzFooter: null,
      nzBodyStyle: {
        paddingTop: '10px'
      },
    });
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageData.filter(({auditStatus}) => (auditStatus === '1'));
    this.checked = listOfEnabledData.every(({id}) => this.setOfCheckedId.has(id));
    this.indeterminate = listOfEnabledData.some(({id}) => this.setOfCheckedId.has(id)) && !this.checked;
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listOfCurrentPageData.filter(({auditStatus}) => (auditStatus === '1'))
      .forEach(({id}) => this.updateCheckedSet(id, checked));
    this.refreshCheckedStatus();
  }

  onCurrentPageDataChange(listOfCurrentPageData: ReadonlyArray<any>): void {
    this.listOfCurrentPageData = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }


  @ConfirmableFlat({
      title: '批量审批',
      content() {
        return `
课程一经审批通过，课程将开放资源研发存储，课包建设权限。
<br/> 请审批以下内容；审批通过将不影响以后修改。
<br/> 1、课程信息是否完善
<br/> 2、知识图谱是否已完善
<br/> <br/> 确定审批选中的${this.data.filter(data => this.setOfCheckedId.has(data.id)).map(item => item.id).length}项？`;
      },
      type: 'confirm',
      nzOkText: '通过',
      nzCancelText: '不通过',
      nzOnCancel(): Promise<boolean> {
        return this.approvBatch('AUDIT_REJECT');
      },
    }
  )
  approvBatchpre(): Promise<boolean> {
    return this.approvBatch('AUDIT_PASS');
  }

  approvBatch(action: 'AUDIT_PASS' | 'AUDIT_REJECT'): Promise<boolean> {
    return new Promise((resolve) => {
      const requestData = this.data.filter(data => this.setOfCheckedId.has(data.id)).map(item => item.id);
      this.courseMgService.batchApproval({
        courseIdList: requestData,
        action
      }).subscribe(res => {
        if (res.status === 201) {
          resolve(true);
          this.searchData('button');
        } else {
          resolve(false);
        }
      }, () => {
        resolve(false);
      });
    });
  }
}
