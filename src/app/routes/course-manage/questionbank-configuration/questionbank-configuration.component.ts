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
  selector: 'app-questionbank-configuration',
  templateUrl: './questionbank-configuration.component.html',
  styleUrls: ['./questionbank-configuration.component.less']
})
export class QuestionbankConfigurationComponent extends FlexTableComponent implements OnInit {
  _PAGE_ID_ = 'QuestionbankConfigurationComponent';
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
  modalForm: FormGroup;
  modalFormRef: NzModalRef;
  isVisible = false;
  orgCode = ToolsUtil.getOrgCode();
  checked: any;
  isModalLoading = false;
  isAreaLoading = false;

  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  @ViewChild('nailingTmp') nailingTmp: TemplateRef<any>;

  constructor(
    public fb: FormBuilder,
    public modalService: NzModalService,
    public menuService: MenuService,
    public courseMgService: CourseManageService,
    public nzMsg: NzMessageService,
    public route: ActivatedRoute,
    public notify: NotifyService,
    public knowledgeManageService: KnowledgeManageService,
    @Inject(LOCALE_ID) public locale: string,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initFrom();
  }

  private initFrom() {
    this.modalForm = this.fb.group({
      id: [''],
      showQuestionType: ['', [Validators.required, spaceValidator(), Validators.maxLength(25)]],
      essentialQuestion: ['', [Validators.required]],
      whetherToEnable: [false, [Validators.required]],
    });
  }

  searchData() {

  }

  confirm() {

  }

  questionConfiguration(title) {
    this.modalFormRef = this.modalService.create({
      nzTitle: title,
      nzContent: this.modalContent,
      nzMaskClosable: false,
      nzWrapClassName: 'vertical-center-modal',
      nzCancelText: '取消',
      nzOkText: '保存',
      nzOnOk: (e) => {
        return this.confirm();
      }
    });
  }


  edit(data: any) {
    this.questionConfiguration('编辑题型');
  }

  startUsing(data: any) {

  }
}
