import {Component, ElementRef, Inject, LOCALE_ID, ViewChild} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NzModalRef, NzModalService} from 'ng-zorro-antd';
import {MenuService} from 'core/services/menu.service';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {NotifyService} from 'core/services/notify.service';
import {NzResizeEvent} from 'ng-zorro-antd/resizable';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {spaceValidator} from 'src/app/shared/validators/atr-validtors';
import {ToolsUtil} from 'core/utils/tools.util';
import {SearchTableComponent} from '../components';
import {PAGE_CONSTANT} from 'core/base/static-data';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {timer} from 'rxjs';
import {ConfirmableFlat} from 'core/decorators';
import {ClipboardService} from 'ngx-clipboard';
import {oMultiDiff, strChineseFirstPY} from 'core/base/static-data';
import {StandardCoursePkgService} from '@app/busi-services';

const ADD_TEXT = '新增空白课包';
const EDIT_TEXT = '编辑课包';

@Component({
  selector: 'app-standard-course-pkg-list',
  templateUrl: './standard-course-pkg-list.component.html',
  styleUrls: ['./standard-course-pkg-list.component.less'],
})
export class StandardCoursePkgListComponent extends SearchTableComponent {
  _PAGE_ID_ = 'StandardCoursePkgListComponent';
  id = -1;
  width;
  userInfo: any = {};
  selectdCourse: any = {}; // 课堂
  curEditData: any = null;
  isVisible = false; // 新建课包
  isShareVisible = false; // 分享弹框
  formTitle = ADD_TEXT;
  listOfData = [];
  coursePackForm: FormGroup;
  modalFormRef: NzModalRef;
  visible = false;
  order = null;
  orgCode = ToolsUtil.getOrgCode();
  ifCurrentStandard = false;
  fg: FormGroup;
  fgLabel: FormGroup;
  fgGtoup: FormGroup;
  courseId = '';
  coursePacketId: any;
  majorId: any;
  isCampusLoading = false;
  userId = LocalStorageUtil.getUserId();
  packtree = true;
  schoolZoneData: any;
  campusData = [];
  checkAll = {
    flag: false
  };
  packSeriesVisibility = false;
  labels = [];
  isSeriesNameLoading = false;
  isSeriesFormLoading = false;
  isSeriesVersionLoading: boolean;
  private init = false;
  private lockAdd = false;
  @ViewChild('treeContainer') treeContainer: ElementRef;

  constructor(
    private fb: FormBuilder,
    private modalService: NzModalService,
    private notifyService: NotifyService,
    private clipboardService: ClipboardService,
    private standardCoursePkgService: StandardCoursePkgService,
    private notify: NotifyService,
    private menuService: MenuService,
    public message: NzMessageService,
    public courseMgService: CourseManageService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    super();
  }

  /*
  * @Override
  * */
  initData(): void {
    this.initForm();
    this.userInfo = LocalStorageUtil.getUser();
    this.replyToTheCourseClick();
  }


  /*
 * @Override
 * */
  resetInit() {
    this.searchWord = '';
    this.selectedVal = '';
    this.searchWordVal = '';
    this.selectedValue = '';
  }

  /*
  * @Override
  * */
  collectParam() {
    const {searchWordVal, selectedVal} = SessionStorageUtil.getSearch(this._PAGE_ID_);
    this.searchWordVal = searchWordVal || '';
    this.selectedVal = selectedVal || '';
  }

  /*
  * @Override
  * */
  sybcParam() {
    this.searchWord = this.searchWordVal;
    this.selectedValue = this.selectedVal;
  }

  /*
  * @Override
  * */
  storingData() {
    const {selectedVal, searchWordVal} = this;
    this.passData({searchWordVal, selectedVal});
  }

  /*
  * @Override
  * @*/
  getDataList(): void {
    const param: any = {
      page: this.pageIndex,
      limit: this.pageSize,
      majorId: this.selectdCourse.professionId
    };
    if (this.selectdCourse.id) {
      param.courseId = this.selectdCourse.id;
    }
    if (this.searchWord) {
      param.searchKey = this.searchWord;
    }
    if (this.selectedValue) {
      param.status = this.selectedValue;
    }
    const success = (result: any) => {
      this.isLoading = false;
      if (result.status === 200) {
        if (result.data.length) {
          this.nzSortOtrderChange(this.order, result.data);
          this.total = result.page.totalResult;
        } else {
          this.listOfData = [];
          this.total = 0;
        }
      }
    };

    const error = (err: any) => {
      this.isLoading = false;
      this.message.create('error', JSON.stringify(err));
    };

    this.isLoading = true;
    this.courseMgService.listPackets(param).subscribe(success, error);
  }

  /*
  * @Override
  * @*/
  ngOnAttach() {
    this.init = false;
    this.packtree = false;
    this.replyToTheCourseClick();
    timer(0).subscribe(() => {
      this.packtree = true;
    });
    this.collectParam();
    this.sybcParam();
  }

  /*
  * @Override
  * @*/
  removeData() {
    super.removeData();
    SessionStorageUtil.removeSelectdCourse();
  }

  replyToTheCourseClick() {
    const courseInfo = SessionStorageUtil.getSelectdCourse();
    if (courseInfo) {
      const {id, professionId} = JSON.parse(courseInfo);
      this.selectdCourse = {
        professionId
      };
      if (id) {
        this.selectdCourse.id = id;
      }
    }
  }

  initForm() {
    this.coursePackForm = this.fb.group({
      name: ['', [Validators.required, spaceValidator(), Validators.maxLength(25)]],
      teachType: ['11', [Validators.required]],
      // pattern: [''],
      // roomType: ['1'],
      id: ['']
    });
    this.fg = this.fb.group({
      ocodes: [[], [Validators.required, spaceValidator()]],
    });

    this.fgLabel = this.fb.group({
      name: ['', [Validators.required, spaceValidator(), Validators.maxLength(50)]],
    });

    this.fgGtoup = this.fb.group({
      series: ['', [Validators.required, spaceValidator()]],
      packetVer: [0, [Validators.required, spaceValidator()]],
    });
  }

  close(): void {
    this.visible = false;
  }


  onResize({width, height}: NzResizeEvent): void {
    const flag = this.treeContainer
      && this.treeContainer.nativeElement
      && this.treeContainer.nativeElement.offsetWidth;
    if (
      flag && ((this.treeContainer.nativeElement.offsetWidth + 80 < width))
      ||
      (flag && (this.treeContainer.nativeElement.offsetWidth + 10) > width)
    ) {
      return;
    }
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.width = width;
    });
  }

  courseChange(item: any): void {
    this.selectdCourse = item;
    SessionStorageUtil.putSelectdCourse(JSON.stringify(item));
    if (!this.init) {
      this.init = true;
      this.searchData('collect');
    } else {
      this.pageIndex = 1;
      this.searchData();
    }
  }

  // 编辑
  startEdit(index: number): void {
    this.formTitle = EDIT_TEXT;
    this.curEditData = this.listOfData[index];
    this.ifCurrentStandard = this.listOfData[index].status === '1' ? true : false;
    this.coursePackForm.patchValue(this.curEditData);
    this.showModal();
  }

  // 新增
  startAdd(): void {
    this.formTitle = ADD_TEXT;
    this.curEditData = {
      name: '',
      teachType: '11',
      // pattern: '',
      // roomType: '1',
      id: ''
    };
    this.coursePackForm.patchValue(this.curEditData);
    // tslint:disable-next-line:forin
    for (const i in this.coursePackForm.controls) {
      this.coursePackForm.controls[i].markAsUntouched();
      this.coursePackForm.controls[i].markAsPristine();
      this.coursePackForm.controls[i].updateValueAndValidity();
    }
    this.showModal();
  }

  goPrepare(item: any, preview?): void {
    this.storageInfo(item, preview);
    this.menuService.gotoUrl({
      title: '课包建设',
      url: '/m/course-manage/prepare-course',
      paramUrl: ``
    });
  }

  storageInfo(item, preview?) {
    const lessonCount = item.lessonCount ? item.lessonCount : '1';
    const isSmart = item.isSmart ? item.isSmart : '0';
    const auditStatus = item.auditStatus ? item.auditStatus : '0';
    const {id, name, status, teachType, createrId, pcode, majorId, courseId, courseCode, majorLeaderId, knowledgeSubjectId} = item;
    SessionStorageUtil.putPacketInfo({
      id,
      name,
      status,
      teachType,
      createrId,
      professionId: majorId,
      code: courseCode,
      isSmart,
      auditStatus,
      lessonCount,
      courseId,
      preview: preview ? '1' : '0',
      curProgress: '0',
      pcode,
      majorLeaderId,
      knowledgeSubjectId
    });
    SessionStorageUtil.clearChapterSelection();
  }


  // 展示弹窗
  showModal() {
    if (this.selectdCourse && this.selectdCourse.id) {
      this.isVisible = true;
    } else {
      this.message.warning('请您确保在一门课程下去新增课包');
    }
  }

  saveCourse() {
    // tslint:disable-next-line:forin
    for (const key in this.coursePackForm.controls) {
      // if (key !== 'pattern') {
      this.coursePackForm.controls[key].updateValueAndValidity();
      this.coursePackForm.controls[key].markAsDirty();
      // }
    }
    if (this.coursePackForm.valid && !this.lockAdd) {
      // if (this.coursePackForm.value.teachType !== '22' && this.coursePackForm.value.pattern === '') {
      //   this.message.warning('课包模式不能为空');
      //   return false;
      // }
      this.lockAdd = true;
      const params = JSON.parse(JSON.stringify(this.coursePackForm.value));
      /* if (this.coursePackForm.value.teachType === '22') {
         params.pattern = '';
       }*/
      params.courseId = this.selectdCourse.id;
      params.majorId = this.selectdCourse.professionId;
      params.courseCode = this.selectdCourse.code;
      const success = (result: any) => {
        this.isLoading = false;
        timer(500).subscribe(() => {
          this.lockAdd = false;
        });
        if (result.status === 201) {
          this.isVisible = false;
          this.pageIndex = 1;
          this.searchData();
        } else {
          this.message.create('error', result.message);
        }
      };

      const error = (err: any) => {
        this.isLoading = false;
        timer(500).subscribe(() => {
          this.lockAdd = false;
        });
        this.message.create('error', JSON.stringify(err));
      };

      this.isLoading = true;
      this.courseMgService
        .saveOrUpdate_coursePacket(params)
        .subscribe(success, error);
    }
    return false;
  }

  delPacketAction(data) {
    if (!this.delIf(data)) {
      return;
    }
    this.delPacket(data);
  }

  @ConfirmableFlat({
      title: '删除课包',
      content: '确定删除课包？',
      type: 'confirm'
    }
  )
  delPacket(data: any) {
    return new Promise((resole) => {
      const success = (result: any) => {
        if (result.status === 204) {
          resole(true);
          this.searchData();
        } else {
          resole(false);
          this.message.create('error', result.message);
        }
      };
      const error = (err: any) => {
        resole(false);
        this.message.create('error', JSON.stringify(err));
      };
      this.standardCoursePkgService.delCourse(data.id, data.status).subscribe(success, error);
    });
  }

  @ConfirmableFlat({
      title: '课包复制',
      content: (args) => ('您确定复制' + args[0].name + '课包吗？'),
      type: 'confirm'
    }
  )
  copyPacket(data: any) {
    return new Promise((resole) => {
      this.courseMgService.copy_coursePacket(data.id).subscribe((res) => {
        if (res.status !== 201) {
          this.message.error(res.message);
          resole(false);
          return;
        }
        this.searchData();
        resole(true);
      });
    });
  }


  lessonBuy(data) {
    this.modalService.confirm({
      nzTitle: '课包',
      nzContent: `您确定将“${data.name}”${((!data.isSale) || data.isSale === '0') ? '售卖' : '取消售卖'}吗 ？`,
      nzOkText: '确定',
      nzCancelText: '取消',
      nzOnOk: () => {
        return new Promise((resole, reject) => {
          const isSale = ((!data.isSale) || data.isSale === '0') ? '1' : '0';
          this.courseMgService
            .lessonBuy(data.id, isSale)
            .subscribe((res) => {
              if (res.status !== 201) {
                this.message.error(res.message);
                resole(false);
                return;
              }
              this.searchData();
              resole(true);
            });
        });
      },
    });
  }

  usePacket(data: any) {
    this.modalService.confirm({
      nzTitle: '课包',
      nzContent: `您确定将“${data.name}”${data.isUsed === '0' ? '投入使用' : '取消使用'}吗 ？`,
      nzOkText: '确定',
      nzCancelText: '取消',
      nzOnOk: () => {
        return new Promise((resole, reject) => {
          const isUsed = data.isUsed === '0' ? '1' : '0';
          this.courseMgService
            .UsecoursePacket(data.id, isUsed)
            .subscribe((res) => {
              if (res.status !== 201) {
                this.message.error(res.message);
                resole(false);
                return;
              }
              this.searchData();
              resole(true);
            });
        });
      },
    });
  }

  preview(data: any) {
    this.goPrepare(data, true);
  }


  @ConfirmableFlat({
      title: '提交审批',
      content: '课程一经审批，将不能再对课程的知识图谱与课程建设进行',
    }
  )
  submitForApproval(data: any) {
  }

  @ConfirmableFlat({
      title: '重新提交',
      content: (args) => ('确定对' + args[0].name + '课程进行重新提交吗?'),
    }
  )
  resubmit(data: any) {
  }

  @ConfirmableFlat({
      title: '撤销审批',
      content: (args) => ('确定撤销对' + args[0].name + '课程的审批吗?'),
      type: 'warning'
    }
  )
  withdrawApproval(data: any) {
  }

  @ConfirmableFlat({
      title: '反审批',
      content: (args) => ('确定对' + args[0].name + '课程进行反审批吗?'),
      type: 'warning'
    }
  )
  antiApproval(data: any) {
  }


  getTeacheType(teachType: any) {
    switch (teachType) {
      case '11':
        return '线下面授';
      case '12':
        return '线下双师';
      case '21':
        return '线上直播';
      case '22':
        return '线上录播';
      default :
        return '--';
    }
  }

  // 校区授权
  schoolDistrict(data: any) {
    this.visible = true;
    this.coursePacketId = data.id;
    this.majorId = data.majorId;
    this.courseId = data.courseId;
    this.getheCampus();
  }

  getheCampus() {
    this.courseMgService.getTheCampus(this.coursePacketId).subscribe(res => {
        if (res.status === 200) {
          if (res.data && res.data.length) {
            this.fg.patchValue({
              ocodes: res.data
            });
          } else {
            if (!this.campusData.length) {
              const list = [];
              this.schoolZoneData.opts.map(item => {
                if (item.children && item.children.length > 0) {
                  item.children.map(it => {
                    list.push(it.key);
                  });
                }
              });
              this.campusData = list;
            }
            this.fg.patchValue({
              ocodes: this.campusData
            });
            this.checkAll.flag = true;
          }
          // tslint:disable-next-line:forin
          for (const i in this.fg.controls) {
            this.fg.controls[i].markAsUntouched();
            this.fg.controls[i].markAsPristine();
            this.fg.controls[i].updateValueAndValidity();
          }
        }
      }
    );
  }

  saveTheCampus() {
    // tslint:disable-next-line:forin
    for (const i in this.fg.controls) {
      this.fg.controls[i].markAsDirty();
      this.fg.controls[i].updateValueAndValidity();
    }
    if (this.fg.invalid) {
      return;
    }
    const params: any = {
      courseId: this.courseId,
      coursePacketId: this.coursePacketId,
      orgCode: this.orgCode,
      subCodes: '',
    };
    if (!this.checkAll.flag && this.fg.value.ocodes.length) {
      params.subCodes = this.fg.value.ocodes.join(',');
    } else if (!this.fg.value.ocodes.length) {
      const list = [];
      this.schoolZoneData.opts.forEach(opts => {
        list.push(opts.key);
      });
      params.subCodes = list.join(',');

    }
    this.isCampusLoading = true;
    this.courseMgService.saveTheCampus(params).subscribe(res => {
        this.isCampusLoading = false;
        if (res.status === 201) {
          this.visible = false;
        } else {
          this.message.error(JSON.stringify(res));
        }
      }, (err) => {
        this.isCampusLoading = false;
      }
    );
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
        return '标准';
      case '3':
        return '未通过';
      case '4':
        return '撤回';
      default :
        return '未知';
    }
  }

  getPattern(pattern: string) {
    switch (pattern) {
      case '1':
        return '2.5H';
      case '2':
        return '3.0H';
      default:
        return '--';
    }
  }

  closeModal() {
    this.isVisible = false;
    this.ifCurrentStandard = false;
  }


  chapterClick(profession: any) {
    this.selectdCourse = {professionId: profession.id};
    SessionStorageUtil.putSelectdCourse( JSON.stringify(this.selectdCourse));
    this.pageIndex = 1;
    this.getDataList();
  }

  schoolZone(data) {
    this.schoolZoneData = data;
  }


  enterSeriesManagement() {
    if (!this.selectdCourse.id) {
      this.message.warning('请确保选中一门课程后使用系列管理功能');
      return;
    }
    this.menuService.gotoUrl({
      title: '系列管理',
      url: '/m/course-manage/series-management',
      paramUrl: '?courseId=' + this.selectdCourse.id
    });
  }


  seriesManagement() {
    return new Promise((resolve) => {
      this.courseMgService.coursePackageSeriesList({
        courseId: this.selectdCourse.id,
        page: 1,
        limit: 10000
      }).subscribe(res => {
        if (res.status === 200) {
          this.labels = res.data;
        }
        this.isSeriesNameLoading = false;
        resolve();
      }, err => {
        this.message.error(err.message);
        this.isSeriesNameLoading = false;
        resolve();
      });
    });
  }

  getTheVersionNumber(data) {
    return new Promise((resolve) => {
      this.isSeriesVersionLoading = true;
      this.courseMgService.getTheVersionNumber({
        id: data.id,
        courseSeriesId: data.courseSeriesId
      }).subscribe(res => {
        if (res.status === 200) {
          this.fgGtoup.patchValue({
            packetVer: res.data
          });
          resolve(true);
        } else {
          if (res.status === 500) {
            this.message.error(res.message);
          }
          resolve(false);
        }
        this.isSeriesVersionLoading = false;
      }, err => {
        this.message.error('获取版本信息出错');
        this.isSeriesVersionLoading = false;
        resolve(false);
      });
    });
  }

  grouping(data: any) {
    if (!this.selectdCourse.id) {
      this.message.warning('请确保在一门课程下使用课包分组系类功能');
      return;
    }
    this.isSeriesNameLoading = true;
    this.fgGtoup.patchValue({
      series: data.courseSeriesId,
    });
    if (!data.packetVer) {
      this.getTheVersionNumber(data).then((flag) => {
        this.expandTheBulletFrame(data);
      });
    } else {
      this.fgGtoup.patchValue({
        packetVer: data.packetVer
      });
      this.expandTheBulletFrame(data);
    }
  }

  expandTheBulletFrame(data) {
    // tslint:disable-next-line:forin
    for (const i in this.fgGtoup.controls) {
      this.fgGtoup.controls[i].markAsUntouched();
      this.fgGtoup.controls[i].markAsPristine();
      this.fgGtoup.controls[i].updateValueAndValidity();
    }
    this.seriesManagement().then(() => {
      this.packSeriesVisibility = true;
      this.coursePacketId = data.id;
    });
  }

  setSeries() {
    Object.keys(this.fgGtoup.controls).forEach((control) => {
      this.fgGtoup.controls[control].markAsDirty();
      this.fgGtoup.controls[control].updateValueAndValidity();
    });
    if (this.fgGtoup.invalid) {
      return;
    }
    this.isSeriesFormLoading = true;
    this.courseMgService.saveOrUpdate_coursePacket({
      id: this.coursePacketId,
      courseSeriesId: this.fgGtoup.value.series,
      packetVer: this.fgGtoup.value.packetVer
    }).subscribe((res) => {
      if (res.status === 201) {
        this.packSeriesVisibility = false;
        this.getDataList();
      }
      this.isSeriesFormLoading = false;
    }, err => {
      this.isSeriesFormLoading = false;
    });
  }

  delIf(data) {
    return data.auditStatus === '0'
      || data.auditStatus === '3'
      || (data.auditStatus === '2' && data.leaderId === this.userId && data?.isUsed === '0' && data.isSale === '0');
  }

  getDelCompetence(data: any) {
    if (!this.delIf(data)) {
      return '标准课包，只有课程负责人才权限删除 ，当课包处于已启用/已售卖时不可删除。';
    } else {
      return null;
    }
  }


  ifJoinTheSeries(data) {
    return data.status === '1';
  }

  nzSortOtrderChange(data: any, list?) {
    this.order = data;
    const dataList = list ? list : this.listOfData;
    if (data === 'ascend') {
      this.listOfData = dataList.sort((stringA, stringB) => {
        const sA = this.makePy(stringA.courseSeriesName || '--')[0].toLowerCase();
        const sB = this.makePy(stringB.courseSeriesName || '--')[0].toLowerCase();
        if (sA < sB) {
          return -1;
        }
        if (sA > sB) {
          return 1;
        }
        if ((stringA.packetVer || 0) > (stringB.packetVer || 0)) {
          return 1;
        }
        if ((stringA.packetVer || 0) < (stringB.packetVer || 0)) {
          return -1;
        }
        return 0;
      });
    } else if (data === 'descend') {
      this.listOfData = dataList.sort((stringB, stringA) => {
        const sA = this.makePy(stringA.courseSeriesName || '--')[0].toLowerCase();
        const sB = this.makePy(stringB.courseSeriesName || '--')[0].toLowerCase();
        if (sA < sB) {
          return -1;
        }
        if (sA > sB) {
          return 1;
        }
        if ((stringA.packetVer || 0) > (stringB.packetVer || 0)) {
          return 1;
        }
        if ((stringA.packetVer || 0) < (stringB.packetVer || 0)) {
          return -1;
        }
        return 0;
      });
    } else {
      this.listOfData = dataList.sort((stringB, stringA) => {
        if (stringA.lastModifiedTime < stringB.lastModifiedTime) {
          return -1;
        }
        if (stringA.lastModifiedTime > stringB.lastModifiedTime) {
          return 1;
        }
        return 0;
      });
    }
  }

  seriesChange(courseSeriesId: any) {
    if (courseSeriesId) {
      this.isSeriesVersionLoading = true;
      this.courseMgService.getTheVersionNumber({
        id: this.coursePacketId,
        courseSeriesId
      }).subscribe(res => {
        if (res.status === 200) {
          this.fgGtoup.patchValue({
            packetVer: res.data
          });
        } else {
          if (res.status === 500) {
            this.message.error(res.message);
          }
        }
        this.isSeriesVersionLoading = false;
      }, err => {
        this.message.error('获取版本信息出错');
        this.isSeriesVersionLoading = false;
      });
    }
  }

// 获取拼音首字母
  makePy(str) {
    if (typeof (str) === 'string') {
      const arrResult = new Array(); // 保存中间结果的数组
      for (let i = 0, len = str.length; i < len; i++) {
        // 获得unicode码
        const ch = str.charAt(i);
        // 检查该unicode码是否在处理范围之内,在则返回该码对映汉字的拼音首字母,不在则调用其它函数处理
        arrResult.push(this.checkCh(ch));
      }
      // 处理arrResult,返回所有可能的拼音首字母串数组
      return this.mkRslt(arrResult);
    }
  }

  checkCh(ch) {
    const uni = ch.charCodeAt(0);
    // 如果不在汉字处理范围之内,返回原字符,也可以调用自己的处理函数
    if (uni > 40869 || uni < 19968) {
      return ch;
    } // dealWithOthers(ch);
    // 检查是否是多音字,是按多音字处理,不是就直接在strChineseFirstPY字符串中找对应的首字母
    return (oMultiDiff[uni] ? oMultiDiff[uni] : (strChineseFirstPY.charAt(uni - 19968)));
  }

  mkRslt(arr) {
    let arrRslt = [''];
    for (let i = 0, len = arr.length; i < len; i++) {
      const str = arr[i];
      const strlen = str.length;
      if (strlen === 1) {
        for (let k = 0; k < arrRslt.length; k++) {
          arrRslt[k] += str;
        }
      } else {
        const tmpArr = arrRslt.slice(0);
        arrRslt = [];
        for (let k = 0; k < strlen; k++) {
          // 复制一个相同的arrRslt
          const tmp = tmpArr.slice(0);
          // 把当前字符str[k]添加到每个元素末尾
          for (let j = 0; j < tmp.length; j++) {
            tmp[j] += str.charAt(k);
          }
          // 把复制并修改后的数组连接到arrRslt上
          arrRslt = arrRslt.concat(tmp);
        }
      }
    }
    return arrRslt;
  }

  approvalling(data) {
    return !data.auditStatus || (data.auditStatus && Number(data.auditStatus) !== 1);
  }
}
