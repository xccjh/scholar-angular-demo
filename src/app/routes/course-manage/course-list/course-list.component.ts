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
import {AreaZkDataType, CourseListDataType, NewMajorTypeParams} from 'core/base/common';
import {ResolverDataComponent} from '../components';
import {APPROVE_MAP, BURRON_COURSE} from 'core/base/static-data';
import {ConfirmableFlat} from 'core/decorators';
import {Store} from '@ngrx/store';
import {LoadingControl} from 'core/base/common';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';

@Component({
  selector: 'app-course-list',
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.less']
})
export class CourseListComponent extends ResolverDataComponent implements OnInit {
  _PAGE_ID_ = 'CourseListComponent';
  data: CourseListDataType[] = [];
  areaZk: AreaZkDataType[] = [];
  id = -1;
  userInfo = LocalStorageUtil.getUser();
  userId = this.userInfo.id;
  create = this.userInfo.nickName;
  modalForm: FormGroup;
  modalFormRef: NzModalRef;
  isVisible = false;
  orgCode = ToolsUtil.getOrgCode();
  checked = false;
  isModalLoading = false;
  isAreaLoading = false;
  nailingApprovalvisible = false;
  editFlag = false;
  isManager: '0' | '1' = '0';
  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  @ViewChild('nailingTmp') nailingTmp: TemplateRef<any>;

  constructor(
    private fb: FormBuilder,
    private modalService: NzModalService,
    private menuService: MenuService,
    private notify: NotifyService,
    private knowledgeManageService: KnowledgeManageService,
    private store$: Store<any>,
    public courseMgService: CourseManageService,
    public message: NzMessageService,
    public route: ActivatedRoute,
    @Inject(LOCALE_ID) public locale: string,
  ) {
    super(route);
    this.initFrom();
  }

  statisticsOfWrongQuestions(data: any) {
    this.menuService.gotoUrl({
      url: '/m/course-manage/wrong-questions',
      title: '????????????',
      paramUrl: '?code=' + data.code
    });
  }

  graphStatistics(data: any) {
    this.menuService.gotoUrl({
      url: '/m/course-manage/graph-statistics',
      title: '????????????',
      paramUrl: '?code=' + data.code
    });
  }

  /*
  * @Overide
  * */
  ngOnInit(): void {
    // const KnowledgeStore$ = this.store$.pipe(select(getKnowledgeFeature));
    // KnowledgeStore$.pipe(select(getKnowledge)).subscribe(res => {
    //
    // });
    super.ngOnInit();
    this.judgmentAuthority();
  }

  /*
   * @Override
   * @*/
  ngOnAttach() {
    super.ngOnAttach();
    this.judgmentAuthority();
  }

  dispatchStore() {
    // this.store$.dispatch(knowledgeAction({
    //   payload: 'test'
    // }));
    // this.store$.dispatch(mutiAction({
    //   payload: {
    //     knowledge: 'test'
    //   }
    // }));
  }

  private approveAll(data, type, loadingControl?: LoadingControl): Promise<boolean> {
    return new Promise((resolve) => {
      loadingControl.loading = true;
      this.knowledgeManageService.approveAll({
        courseId: data.id,
        action: APPROVE_MAP[type]
      }).subscribe(res => {
          loadingControl.loading = false;
          if (res.status === 201) {
            resolve(true);
            this.searchData();
          } else {
            resolve(false);
          }
        }, () => {
          resolve(false);
          loadingControl.loading = false;
        }
      );
    });
  }

  /**
   *  ????????????????????????
   * @param data ??????item
   */
  private getAreaZk(data?: CourseListDataType): void {
    if (this.orgCode === 'zksd') {
      this.isAreaLoading = true;
      this.courseMgService.getAreaZk().subscribe(res => {
        this.isAreaLoading = false;
        if (res.status === 200) {
          this.areaZk = res.data;
          if (data) {
            if (data.areaIdList.length === this.areaZk.length) {
              this.checked = true;
            } else {
              this.checked = false;
            }
          }
        }
      }, err => {
        this.isAreaLoading = false;
      });
    }
  }

  /**
   *  ??????/????????????
   * @param data ??????item
   */
  showCourseModal(data?: CourseListDataType): void {
    this.editFlag = !!data;
    this.checked = false;
    this.echoData(data);
    // this.getAreaZk(data);
    this.showModal(data ? '????????????' : '????????????');
  }

  preview(data: CourseListDataType): void {
    SessionStorageUtil.removeKnowledgeGraphTab(); // ???????????????????????????tab??????????????????????????????
    SessionStorageUtil.putCourseType('0'); // ??????????????????
    this.menuService.gotoUrl({url: '/m/course-manage/course-preview', paramUrl: `/${data.id}`});
  }

  @ConfirmableFlat({
      title: '??????',
      content: (arg) => (arg[0].status === '1' ? '??????????????????????????????????????????????????????????????????????????????????????????' : '????????????' + arg[0].name + '????????????'),
      type: 'error'
    }
  )
  del(data: CourseListDataType, loadingControl?: LoadingControl): Promise<boolean> {
    return new Promise((resolve) => {
      loadingControl.loading = true;
      this.courseMgService.delCousre(data.id).subscribe((result: any) => {
        loadingControl.loading = false;
        if (result.status === 204) {
          resolve(true);
          this.getDataList();
        } else {
          resolve(false);
          this.message.create('error', result.message);
        }
      }, (err: any) => {
        resolve(false);
        loadingControl.loading = false;
        this.message.create('error', JSON.stringify(err));
      });
    });
  }

  @ConfirmableFlat({
    title: args => args[0],
    content() {
      return this.modalContent;
    },
    type: 'create',
    nzBodyStyle: {paddingBottom: '0px'}
  })
  private showModal(title: string, loadingControl?: LoadingControl): Promise<boolean> {
    return this.confirm(loadingControl);
  }

  confirm(loadingControl?: LoadingControl): Promise<boolean> {
    return new Promise((resolve) => {
      for (const i in this.modalForm.controls) {
        if (this.modalForm.controls.hasOwnProperty(i)) {
          this.modalForm.controls[i].markAsDirty();
          this.modalForm.controls[i].updateValueAndValidity();
        }
      }
      if (this.modalForm.invalid) {
        this.message.warning('?????????????????????????????????');
        resolve(false);
        return;
      }
      if (loadingControl) {
        loadingControl.loading = true;
      }
      this.isModalLoading = true;
      const params: NewMajorTypeParams = JSON.parse(JSON.stringify(this.modalForm.value));
      if (this.orgCode === 'zksd') {
        params.eduLevel = this.modalForm.value.eduLevel.join(',');
      }
      this.courseMgService.newMajor(params).subscribe(res => {
        this.isModalLoading = false;
        if (loadingControl) {
          loadingControl.loading = true;
        }
        if (res.status === 201) {
          this.pageIndex = 1;
          this.getDataList();
          resolve(true);
        } else {
          if (res.status === 500) {
            this.message.error(res.message);
          }
          resolve(false);
        }
      }, err => {
        this.isModalLoading = false;
        if (loadingControl) {
          loadingControl.loading = true;
        }
        resolve(false);
      });
    });
  }

  /**
   * ????????????
   * @param data ??????item
   */
  curriculumConstruction(data: CourseListDataType) {
    SessionStorageUtil.putCourseName(data.name);
    this.menuService.gotoUrl({
      // url: '/m/course-manage/course-details',
      url: '/m/course-manage/scp-course',
      paramUrl: `/${data.id}/${data.knowledgeSubjectId}/${data.status}/${data.auditStatus}/${data.code}/${data.leaderId}`,
      title: '????????????'
    });
  }

  knowledgeGraph(data: CourseListDataType) {
    SessionStorageUtil.putCourseName(data.name);
    this.menuService.gotoUrl({
      url: '/m/kno/structure',
      paramUrl: `/${data.knowledgeSubjectId}/${data.id}/${data.status}/${data.auditStatus}/${data.code}`,
      title: '????????????'
    });
  }

  @ConfirmableFlat({
      title: '????????????',
      content: '????????????????????????????????????????????????????????????????????????????????????',
    }
  )
  submitForApproval(data: CourseListDataType, loadingControl?: LoadingControl): Promise<boolean> {
    return this.approveAll(data, '0', loadingControl);
  }

  @ConfirmableFlat({
      title: '????????????',
      content: (args) => ('?????????' + args[0].name + '??????????????????????????????????????????????????????????????????????????????????????????????????????????????????'),
    }
  )
  resubmit(data: CourseListDataType, loadingControl?: LoadingControl): Promise<boolean> {
    return this.approveAll(data, '5', loadingControl);
  }

  @ConfirmableFlat({
      title: '?????????',
      content: (args) => ('?????????' + args[0].name + '???????????????????????????????'),
    }
  )
  antiApproval(data: CourseListDataType, loadingControl?: LoadingControl): Promise<boolean> {
    return this.approveAll(data, '4', loadingControl);
  }

  @ConfirmableFlat({
      title: '????????????',
      content: (args) => ('???????????????' + args[0].name + '???????????????????'),
    }
  )
  withdrawApproval(data: CourseListDataType, loadingControl?: LoadingControl): Promise<boolean> {
    return this.approveAll(data, '1', loadingControl);
  }

  @ConfirmableFlat({
      title: '???????????????',
      content: (args) => ('??????????????????' + args[0].name + '???????????????????'),
    }
  )
  approvalFailed(data: CourseListDataType, loadingControl?: LoadingControl): Promise<boolean> {
    return this.approveAll(data, '3', loadingControl);
  }

  @ConfirmableFlat({
      title: '????????????',
      content: (args) => ('???????????????' + args[0].name + '???????????????????'),
    }
  )
  approved(data: CourseListDataType, loadingControl?: LoadingControl): Promise<boolean> {
    return this.approveAll(data, '2', loadingControl);
  }

  private initFrom() {
    const common = {
      id: [''],
      name: ['', [Validators.required, spaceValidator(), Validators.maxLength(50)]],
      leaderId: ['', [Validators.required]], // ?????????
      courseProviderId: ['', [Validators.required]], // ?????????
      // seq: [1],
    };
    if (this.orgCode === 'zksd') {
      this.modalForm = this.fb.group({
        ...common,
        majorIdList: [[], [Validators.required]],
        eduLevel: [[], [Validators.required]],
        // areaIdList: [[], [Validators.required]],
        courseType: ['', [Validators.required]],
        gbCode: ['', [Validators.required]],
      });
    } else {
      this.modalForm = this.fb.group({
        ...common,
        majorId: ['', [Validators.required]], // ??????
      });
    }
  }

  changeArea(val) {
    if (val) {
      if (this.areaZk.length) {
        this.modalForm.patchValue({
          areaIdList: this.areaZk.map(e => e.id)
        });
      }
    } else {
      this.modalForm.patchValue({
        areaIdList: []
      });
    }
  }

  /**
   * ????????????
   */
  private echoData(data?: CourseListDataType): void {
    if (data) {
      this.create = data.createrName;
      if (typeof data.eduLevel === 'string') {
        const eduLevel = data.eduLevel.split(',');
        data.eduLevel = eduLevel;
      }
      this.modalForm.patchValue(data);
    } else {
      let obj;
      const common = {
        id: '',
        name: '',
        leaderId: '', // ?????????
        courseProviderId: '', // ?????????
        // seq: 1,
      };
      if (this.orgCode === 'zksd') {
        obj = {
          ...common,
          majorIdList: [],
          eduLevel: [],
          // areaIdList: [],
          courseType: '',
          gbCode: ''
        };
      } else {
        obj = {
          ...common,
          majorId: '',
        };
      }
      this.modalForm.patchValue(obj);
    }
    // ????????????
    for (const i in this.modalForm.controls) {
      if (this.modalForm.controls.hasOwnProperty(i)) {
        this.modalForm.controls[i].markAsUntouched();
        this.modalForm.controls[i].markAsPristine();
        this.modalForm.controls[i].updateValueAndValidity();
      }
    }
  }

  /**
   * ????????????
   * @param data ??????ids
   */
  modelChangeSelect(data: string[]) {
    if (data.length === this.areaZk.length) {
      this.checked = true;
    } else {
      this.checked = false;
    }
  }

  /**
   * ????????????
   * @param data ??????item
   */
  @ConfirmableFlat({
    title: '????????????',
    content() {
      return this.nailingTmp;
    },
    nzComponentParams: (args) => args[0],
    type: 'confirm'
  })
  nailingApproval(data: CourseListDataType, loadingControl?: LoadingControl): Promise<boolean> {
    return new Promise((resolve) => {
      const params = {
        courseId: data.id,
        action: APPROVE_MAP[0],
      };
      if (data.auditStatus === '3') {
        params.action = APPROVE_MAP[5];
      }
      loadingControl.loading = true;
      this.knowledgeManageService.nailingApproval(params).subscribe(res => {
        loadingControl.loading = false;
        if (res.status === 201) {
          this.getDataList();
          resolve(true);
        } else {
          resolve(false);
        }
      }, () => {
        loadingControl.loading = false;
        resolve(false);
      });
    });
  }

  /**
   * ???????????????
   * @param data ??????item
   */
  showBuild(data) {
    // || this.isManager === '1'
    return data.auditStatus !== '1' && (data.leaderId === this.userId);
  }

  statistics(data) {
    this.menuService.gotoUrl({
      title: '????????????',
      paramUrl: '?code=' + data.code,
      url: '/m/course-manage/statistics'
    });
  }

  /**
   * ????????????
   */
  judgmentAuthority() {
    this.menuService.loadMenus().subscribe((ret) => {
      if (ret.length) {
        if (ret[0].children && ret[0].children.length) {
          const flag = ret[0].children.every(ee => {
            if (ee.text === '????????????') {
              this.isManager = '1';
            } else {
              return true;
            }
          });
          if (flag) {
            this.isManager = '0';
          }
        }
      }
    });
  }

  /**
   * ????????????????????????????????????
   * @param data ??????item
   */
  showEdit(data: CourseListDataType) {
    let flag = false;
    if (data.zksdLeaderIds) {
      flag = data.zksdLeaderIds.split(',').indexOf(this.userId) > -1;
    }
    if (!flag && data.majorLeaderId) {
      flag = data.majorLeaderId === this.userId;
    }
    return flag && data.auditStatus !== '1';
  }

  initButton(data: any) {
    if (!data.upButtonArr) {
      const buttonArr = JSON.parse(JSON.stringify(BURRON_COURSE));
      buttonArr.forEach(item => {
        if (typeof item.show === 'string') {
          item.show = this[item.show](data);
        }
      });
      data.upButtonArr = buttonArr.filter(item => item.show).slice(0, 3);
      data.dropButtonArr = buttonArr.filter(item => item.show).slice(3, BURRON_COURSE.length);
    }
    return true;
  }

  methodChange(data, i, key) {
    this[data[key][i].method](data);
  }
}
