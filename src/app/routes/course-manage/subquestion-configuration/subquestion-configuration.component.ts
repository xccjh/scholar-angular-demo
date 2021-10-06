import {Component, Inject, LOCALE_ID, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {MenuService} from 'core/services/menu.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {NotifyService} from 'core/services/notify.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {spaceValidator} from '@app/shared/validators/atr-validtors';
import {ToolsUtil} from 'core/utils/tools.util';
import {KnowledgeManageService} from '@app/busi-services/knowledge-manag.service';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {ActivatedRoute} from '@angular/router';
import {
  AreaZkDataType,
  CourseListDataType,
} from 'core/base/common';
import {FlexTableComponent, ResolverDataComponent} from '../components';
import {APPROVE_MAP, PAGE_CONSTANT} from 'core/base/static-data';
import {select, Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-subquestion-configuration',
  templateUrl: './subquestion-configuration.component.html',
  styleUrls: ['./subquestion-configuration.component.less']
})

export class SubquestionConfigurationComponent extends FlexTableComponent implements OnInit {
  _PAGE_ID_ = 'SubquestionConfigurationComponent';
  data: CourseListDataType[] = [];
  areaZk: AreaZkDataType[] = [];
  isLoading = false;
  id = -1;
  userId = LocalStorageUtil.getUserId();
  total = 0;
  pageIndex = PAGE_CONSTANT.page;
  pageSize = PAGE_CONSTANT.limit;
  dateRange = [];
  dateRangeVal = [];
  searchWord = '';
  searchWordVal = '';
  selectedValue = '';
  selectedVal = '';
  modalForm: FormGroup; // 模块
  subQuestionBankForm: FormGroup; // 子题库
  subQuestionBankLabelForm: FormGroup; // 子题库标签
  modalFormRef: NzModalRef;
  isVisible = false;
  orgCode = ToolsUtil.getOrgCode();
  checked: any;
  isModalLoading = false;

  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  @ViewChild('subQuestionBankFormContent') subQuestionBankFormContent: TemplateRef<any>;
  @ViewChild('subQuestionBankLabelContent') subQuestionBankLabelContent: TemplateRef<any>;
  subQuestionBankLabelVisibility: any;
  labels: any;

  constructor(
    public fb: FormBuilder,
    public modalService: NzModalService,
    public menuService: MenuService,
    public courseMgService: CourseManageService,
    public nzMsg: NzMessageService,
    public route: ActivatedRoute,
    public notify: NotifyService,
    public knowledgeManageService: KnowledgeManageService,
    private store$: Store<any>,
    @Inject(LOCALE_ID) public locale: string,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initFrom();
  }

  private initFrom() {
    // 模块
    this.modalForm = this.fb.group({
      id: [''],
      moduleName: ['', [Validators.required, spaceValidator(), Validators.maxLength(25)]],
      moduleType: ['', [Validators.required]],
      whetherToEnable: [false, [Validators.required]],
    });
    // 子题库
    this.subQuestionBankForm = this.fb.group({
      id: [''],
      subQuestionBankName: ['', [Validators.required, spaceValidator(), Validators.maxLength(25)]],
      year: ['', [Validators.required]],
      property: ['1', [Validators.required]],
      subQuestionBankLabel: [false, [Validators.required]],
    });

    // 子题库标签
    this.subQuestionBankLabelForm = this.fb.group({
      id: [''],
      subQuestionBankLabelName: ['', [Validators.required, spaceValidator(), Validators.maxLength(25)]],
    });

  }

// 查询子题库
  searchData() {

  }

// 新增子题库
  confirm() {

  }


  // 子题库删除
  del(data: any) {

  }

  // 子题库编辑
  edit(data: any) {

  }

  // 新增子题库
  addSubQuestionBank(title) {
    this.modalFormRef = this.modalService.create({
      nzTitle: title,
      nzContent: this.subQuestionBankFormContent,
      nzMaskClosable: false,
      nzWrapClassName: 'vertical-center-modal',
      nzCancelText: '取消',
      nzOkText: '保存',
      nzOnOk: (e) => {
        return this.confirm();
      }
    });
  }

  // 子题库标签管理
  subQuestionBankLabelManagement() {
    this.subQuestionBankLabelVisibility = true;
  }

// 禁用子题库
  disable(data: any) {

  }

// 启用子题库
  startUsing(data: any) {

  }

// 子题库标签编辑
  labelEdit(label: any) {

  }

// 子题库标签删除
  labelDel(label: any) {

  }

// 添加子题库标签
  addSubQuestionBankLabel() {
    this.modalFormRef = this.modalService.create({
      nzTitle: '新增子题库',
      nzContent: this.subQuestionBankLabelContent,
      nzMaskClosable: false,
      nzWrapClassName: 'vertical-center-modal',
      nzCancelText: '取消',
      nzOkText: '保存',
      nzOnOk: (e) => {
        return this.confirm();
      }
    });
  }

  // 子题库年份变更
  onChange($event: any) {

  }
}
