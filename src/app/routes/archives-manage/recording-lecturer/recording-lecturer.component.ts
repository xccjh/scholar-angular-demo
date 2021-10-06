import {Component, Inject, Input, LOCALE_ID, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {ToolsUtil} from 'core/utils/tools.util';
import {MenuService} from 'core/services/menu.service';
import {ArchivesManageServer, CourseManageService, KnowledgeManageService} from 'src/app/busi-services';
import {NzMessageService} from 'ng-zorro-antd/message';
import {ActivatedRoute} from '@angular/router';
import {NotifyService} from 'core/services/notify.service';
import {spaceValidator} from '@app/shared/validators/atr-validtors';
import {environment} from '../../../../environments/environment';
import {SearchTableComponent} from '@app/routes/course-manage/components';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';

@Component({
  selector: 'app-recording-lecturer',
  templateUrl: './recording-lecturer.component.html',
  styleUrls: ['./recording-lecturer.component.less']
})

export class RecordingLecturerComponent extends SearchTableComponent implements OnInit {
  _PAGE_ID_ = 'RecordingLecturerComponent';
  id = -1;
  userId = LocalStorageUtil.getUserId();
  modalForm: FormGroup;
  modalFormRef: NzModalRef;
  isVisible = false;
  orgCode = ToolsUtil.getOrgCode();
  checked: any;
  isModalLoading = false;
  isAreaLoading = false;
  isPreviewpolyway = false;
  resourceUrl;
  previewData: any = {};
  isPreviewDetail = false;
  desColumn = {xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1};
  previewTitle = '';
  previewStart = false;
  prefix = environment.OSS_URL;
  courseList = [];
  isEdit = false;
  selectedCourseVal = [];
  selectedCourseValue = [];


  @Input() preview = false;
  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  @ViewChild('nailingTmp') nailingTmp: TemplateRef<any>;


  constructor(
    private fb: FormBuilder,
    private modalService: NzModalService,
    private menuService: MenuService,
    private notify: NotifyService,
    private knowledgeManageService: KnowledgeManageService,
    private httpServer: ArchivesManageServer,
    public courseMgService: CourseManageService,
    public route: ActivatedRoute,
    public message: NzMessageService,
    @Inject(LOCALE_ID) public locale: string,
  ) {
    super();
    this.initFrom();
  }

  /*
 * @Override
 * */
  initData(): void {
    this.getCourseList().then(courseList => {
      if (courseList) {
        this.getDataList();
      }
    });
  }


  /*
 * @Override
 * */
  resetInit() {
    super.resetInit();
    this.selectedCourseVal = [];
    this.selectedCourseValue = [];
  }

  /*
  * @Override
  * */
  collectParam() {
    super.collectParam();
    const {selectedCourseVal} = SessionStorageUtil.getSearch(this._PAGE_ID_);
    this.selectedCourseVal = selectedCourseVal || [];
  }

  /*
  * @Override
  * */
  sybcParam() {
    super.sybcParam();
    this.selectedCourseValue = this.selectedCourseVal;
  }

  /*
  * @Override
  * */
  storingData() {
    const {searchWordVal, selectedCourseVal} = this;
    this.passData({searchWordVal, selectedCourseVal});
  }


  /*
    * @Override
    * @*/
  getDataList() {
    const parpms = {
      limit: this.pageSize,
      page: this.pageIndex,
      sort: 'createTime|desc',
      name: this.searchWordVal.trim(),
      courseIds: this.selectedCourseVal.join(',')
    };
    this.isLoading = true;
    this.httpServer.guideTeacherTableList(parpms).subscribe(res => {
      this.isLoading = false;
      if (!res) {
        return;
      }
      if (res.data && res.data.length > 0) {
        res.data.forEach((item, i) => {
          item.seq = (i + 1) + (this.pageIndex - 1) * this.pageSize;
        });
        this.data = res.data;
      } else {
        this.data = [];
      }
      // tslint:disable-next-line:no-unused-expression
      res.page && (this.total = res.page.totalResult);
    }, () => {
      this.isLoading = false;
    });
  }

  private getCourseList() {
    return new Promise((resolve => {
      this.courseMgService.getCourseListTreeNew().subscribe(res => {
        if (res.status === 200) {
          if (res.data.length) {
            this.courseList = res.data;
            // res.data.forEach(item => {
            //   if (item.courseList && item.courseList.length) {
            //     this.courseList = this.courseList.concat(item.courseList);
            //   }
            // });
          } else {
            this.courseList = [];
          }
          resolve(true);
          // if (this.selectedCourseVal && this.selectedCourseVal.length) {
          //   resolve(true);
          // } else {
          //   if (this.courseList[0] && this.courseList[0].id) {
          //     this.selectedCourseValue = this.selectedCourseVal = [this.courseList[0].id];
          //     resolve(true);
          //   } else {
          //     this.message.warning('未检测到有你的课程，请先新建课程后再进行课包操作');
          //     resolve(false);
          //   }
          // }
        } else {
          resolve(false);
        }
      }, () => {
        resolve(false);
      });
    }));
  }

  private initFrom() {
    this.modalForm = this.fb.group({
      id: [''],
      polywayID: ['', []], // [Validators.required, spaceValidator(), Validators.maxLength(34), Validators.minLength(34)]
      videoName: ['', [Validators.maxLength(25)]], // [Validators.required, spaceValidator(), Validators.maxLength(25)]
      introduction: ['', [Validators.required, spaceValidator(), Validators.maxLength(100)]],
      name: ['', [Validators.required, spaceValidator(), Validators.maxLength(25)]],
      avatar: [[], [Validators.required]],
      courseIds: [[], [Validators.required]]
    });
  }

  searchData(reset: boolean | string = false) {
    if (reset === 'button') {
      this.pageIndex = 1;
      this.sybcParam();
    } else if (reset === 'collect') {
      this.collectParam();
      this.sybcParam();
    } else if (reset) {
      this.resetData();
    }
    this.getDataList();
  }


  handlepreVideo(data: any) {
    if (!data.videoId) {
      return this.message.warning('抱歉, 当前id为空, 无法观看');
    }
    this.resourceUrl = data.videoId;
    this.previewTitle = '';
    this.isPreviewpolyway = true;
    this.previewStart = true;
  }

  closePreview() {
    this.isPreviewpolyway = false;
    this.resourceUrl = '';
    this.previewTitle = '';
    this.previewStart = false;
  }


  questionConfiguration(data?) {
    // tslint:disable-next-line:forin
    for (const i in this.modalForm.controls) {
      this.modalForm.controls[i].markAsUntouched();
      this.modalForm.controls[i].markAsPristine();
      this.modalForm.controls[i].updateValueAndValidity();
    }
    if (data) {
      this.modalForm.patchValue({
        id: data.id,
        polywayID: data.videoId,
        videoName: data.videoName,
        introduction: data.introduction,
        name: data.name,
        avatar: [{path: data.avatar, title: '个人头像', name: '个人头像', seq: 0}],
        courseIds: data.course.map(item => item.courseId)
      });
    } else {
      this.modalForm.patchValue({
        id: '',
        polywayID: '',
        videoName: '',
        introduction: '',
        name: '',
        avatar: [],
        courseIds: []
      });
    }

    this.modalFormRef = this.modalService.create({
      nzTitle: data ? '编辑讲师' : '新增讲师',
      nzContent: this.modalContent,
      nzMaskClosable: false,
      nzWrapClassName: 'vertical-center-modal',
      nzCancelText: '取消',
      nzOkText: '保存',
      nzOnOk: () => {
        return new Promise((resolve) => {
          Object.keys(this.modalForm.controls).forEach(key => {
            this.modalForm.controls[key].markAsDirty();
            this.modalForm.controls[key].updateValueAndValidity();
          });
          if (this.modalForm.invalid) {
            resolve(false);
            return;
          }
          const {
            videoName,
            introduction,
            polywayID,
            name,
            avatar,
            courseIds
          } = this.modalForm.value;
          const params = {
            name,
            introduction,
            videoId: polywayID,
            videoName,
            id: this.modalForm.value.id || '',
            avatar: avatar[0].path,
            courseIds
          };
          this.httpServer.guideTeacherAddEdit(params).subscribe((res) => {
            if (res.status === 201) {
              this.pageIndex = 1;
              this.searchData();
              resolve(true);
            }
          });
        });
      }
    });
  }

  previewItem(data: any) {
    this.httpServer.guideTeacherDetails({id: data.id}).subscribe(res => {
      if (!res) {
        return;
      }
      this.previewData = res.data;
      this.isPreviewDetail = true;
    });
  }

  handleTableRowDel(row): void {
    this.modalService.warning({
      nzTitle: '提示',
      nzContent: '确认删除吗? ',
      nzCancelText: '取消',
      nzOnOk: () => {
        return new Promise((resolve) => {
          this.httpServer.guideTeacherDel({
            id: row.id
          }).subscribe((res) => {
            if (res.status === 204) {
              resolve(true);
              this.searchData();
            } else {
              resolve(false);
              if (res.status === 500) {
                this.message.error('服务器业务异常');
              }
            }
          }, () => resolve(false));
        });
      }
    });
  }

  getCourseName(data: any) {
    return data.course.length > 0 ? data.course.map(e => e.courseName).join(',') : '--';
  }
}
