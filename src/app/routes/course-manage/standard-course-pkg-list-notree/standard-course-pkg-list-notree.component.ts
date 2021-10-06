import {Component, Inject, LOCALE_ID} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NzModalRef, NzModalService} from 'ng-zorro-antd';
import {MenuService} from 'core/services/menu.service';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {NotifyService} from 'core/services/notify.service';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {spaceValidator} from 'src/app/shared/validators/atr-validtors';
import {ToolsUtil} from 'core/utils/tools.util';
import {SearchTableComponent} from '../components';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {ConfirmableFlat} from 'core/decorators';
import {BURRON_PACKETAGE, oMultiDiff, strChineseFirstPY} from 'core/base/static-data';
import {formatDate} from '@angular/common';
import {CourseItem, LoadingControl, PacketInfo, PackInfoItem} from 'core/base/common';
import {StandardCoursePkgService} from '@app/busi-services';


@Component({
  selector: 'app-standard-course-pkg-list-notree',
  templateUrl: './standard-course-pkg-list-notree.component.html',
  styleUrls: ['./standard-course-pkg-list-notree.component.less'],
})
export class StandardCoursePkgListNotreeComponent extends SearchTableComponent {
  _PAGE_ID_ = 'StandardCoursePkgListComponent';
  userInfo = LocalStorageUtil.getUser();
  orgCode = ToolsUtil.getOrgCode();
  userId = this.userInfo.id;
  selectdCourse: Partial<CourseItem> = {}; // 当前选中课程
  curEditData: PackInfoItem = {nickName: ''}; // 正编辑课包
  listOfData: Partial<PackInfoItem>[] = []; // 课包列表
  isVisible = false; // 新建编辑课包
  visible = false; // 所属校区
  formTitle: string; // 弹框标题
  coursePackForm: FormGroup;
  fg: FormGroup; // 所属校区
  fgGtoup: FormGroup; // 课包分组
  modalFormRef: NzModalRef;
  order = null; // 课包排序
  courseId = '';
  coursePacketId = '';
  majorId = '';
  campusData: string[] = [];
  checkAll = {
    flag: false
  };
  packSeriesVisibility = false;
  labels: ({ name: string; id: string }[]) = [];
  isCampusLoading = false;
  isSeriesNameLoading = false;
  isSeriesFormLoading = false;
  isSeriesVersionLoading = false;
  courseList: Partial<CourseItem>[] = []; // 所属课程列表
  courseListSelect: Partial<CourseItem>[] = []; // 所属课程列表
  isCourseListLoading = false;
  isEdit = false; // 是否编辑
  courseMapName: any = {}; // 课程映射缓存 id => name
  courseMapId: any = {}; // 课程映射缓存 name=>id
  courseMapMajorId: any = {}; // 课程映射缓存 id=>majorId
  courseMapCourseCode: any = {}; // 课程映射缓存 id => code
  courseSubjectTypeArr = []; // 缓存课程科目类型数组
  courseSubjectTypeMap = {};  // 缓存课程科目类型映射 value=>name
  getCourseSubjectTypeLoading = false; // 课程科目类型loading
  coursePackageHistoryVisibility = false;  // 课包历史
  isCoursePackageHistoryLoading = false; // 课包历史loading
  selectedCourseVal = ''; // 所属课程
  selectedCourseValue = '';
  curSchollData: Partial<{
    dataLength: number
    dataPLength: number
    opts: {
      key: string;
      title: string;
      value: string;
      children: {
        key: string;
        title: string;
        value: string;
        isLeaf: boolean;
      } []
    }[]
  }> = {};

  constructor(
    private fb: FormBuilder,
    private modalService: NzModalService,
    private standardCoursePkgService: StandardCoursePkgService,
    private notify: NotifyService,
    private menuService: MenuService,
    public message: NzMessageService,
    public courseMgService: CourseManageService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    super();
    this.initForm();
  }

  /*
  * @Override
  * */
  initData(): void {
    this.getCourseSubjectTypeArr();
    Promise.all([this.getCourseList()]).then(data => {
      if (data[0]) {
        this.getDataList();
      }
    });
  }


  /*
 * @Override
 * */
  resetInit() {
    super.resetInit();
    this.selectedCourseVal = '';
    this.selectedCourseValue = '';
  }

  /*
  * @Override
  * */
  collectParam() {
    super.collectParam();
    const {selectedCourseVal} = SessionStorageUtil.getSearch(this._PAGE_ID_);
    this.selectedCourseVal = selectedCourseVal || '';
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
    const {selectedVal, searchWordVal, selectedCourseVal, dateRangeVal} = this;
    this.passData({searchWordVal, selectedVal, selectedCourseVal, dateRangeVal});
  }

  /*
  * @Override
  * @*/
  getDataList(): void {
    // if (!this.selectedCourseVal) {
    //   this.message.warning('请先选择课程再查询！');
    //   return;
    // }
    const param: any = {
      page: this.pageIndex,
      limit: this.pageSize,
    };
    if (this.selectedCourseVal) {
      param.courseId = this.selectedCourseVal;
    }
    if (this.searchWord) {
      param.searchKey = this.searchWord.trim();
    }
    if (this.selectedValue) {
      param.status = this.selectedValue;
    }
    if (this.dateRange.length) {
      param.updateTimeStart = formatDate(this.dateRange[0], 'yyyy-MM-dd', this.locale);
      param.updateTimeEnd = formatDate(this.dateRange[1], 'yyyy-MM-dd', this.locale);
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


  initForm() {
    const params = {
      name: ['', [Validators.required, spaceValidator(), Validators.maxLength(50)]],
      teachType: ['11', [Validators.required]],
      // pattern: [''],
      // roomType: ['1'],
      id: [''],
      selectedCourse: ['', [Validators.required]],
      courseSubjectTypeId: [''],
      exerciseType: ['1', [Validators.required]],
    };
    this.coursePackForm = this.fb.group(params);
    this.fg = this.fb.group({
      ocodes: [[], [Validators.required, spaceValidator()]],
    });

    this.fgGtoup = this.fb.group({
      series: ['', [Validators.required, spaceValidator()]],
      packetVer: [0, [Validators.required, spaceValidator()]],
    });
  }

  close(): void {
    this.visible = false;
  }


  getCourseSubjectTypeArr() {
    return new Promise(resolve => {
      // this.getCourseSubjectTypeLoading = true;
      this.standardCoursePkgService.getCoursePackList().subscribe(res => {
        // this.getCourseSubjectTypeLoading = false;
        if (res && typeof res !== 'string' && res.length) {
          this.courseSubjectTypeArr = res;
          this.courseSubjectTypeArr.forEach(e => {
            this.courseSubjectTypeMap[e.VALUE] = e.NAME;
          });
        } else {
          this.courseSubjectTypeArr = [];
        }
        resolve(true);
      }, () => {
        // this.getCourseSubjectTypeLoading = false;
        resolve(false);
      });
    });
  }

  // 编辑
  startEdit(data): void {
    this.getCourseSubjectTypeArr();
    this.isEdit = true;
    this.formTitle = '编辑课包';
    this.curEditData = data;
    this.coursePackForm.patchValue({...this.curEditData, selectedCourse: this.curEditData.courseId});
    this.showModal();
  }

  // 新增
  startAdd(): void {
    this.getCourseSubjectTypeArr();
    this.isEdit = false;
    this.formTitle = '新增空白课包';
    this.curEditData = {
      name: '',
      teachType: '11',
      // pattern: '',
      // roomType: '1',
      id: '',
      selectdCourse: '',
      exerciseType: '1',
      courseSubjectTypeId: ''
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

  goPrepare(item: PacketInfo, preview?: boolean): void {
    SessionStorageUtil.putPacketInfo(item, preview);
    SessionStorageUtil.clearChapterSelection();
    this.menuService.gotoUrl({
      title: '课包建设',
      url: '/m/course-manage/prepare-course',
      paramUrl: ``
    });
  }

  // 展示弹窗
  showModal() {
    this.isVisible = true;
  }

  saveCourse() {
    // tslint:disable-next-line:forin
    for (const key in this.coursePackForm.controls) {
      // if (key !== 'pattern') {
      this.coursePackForm.controls[key].updateValueAndValidity();
      this.coursePackForm.controls[key].markAsDirty();
      // }
    }
    if (this.coursePackForm.valid) {
      // if (this.coursePackForm.value.teachType !== '22' && this.coursePackForm.value.pattern === '') {
      //   this.message.warning('课包模式不能为空');
      //   return false;
      // }
      const params = JSON.parse(JSON.stringify(this.coursePackForm.value));
      /* if (this.coursePackForm.value.teachType === '22') {
         params.pattern = '';
       }*/
      params.courseId = this.coursePackForm.value.selectedCourse;
      params.majorId = this.courseMapMajorId[params.courseId];
      params.courseCode = this.courseMapCourseCode[params.courseId];
      const success = (result: any) => {
        this.isLoading = false;
        this.isVisible = false;
        if (result.status === 201) {
          this.pageIndex = 1;
          this.searchData();
        } else {
          this.message.create('error', result.message);
        }
      };

      const error = (err: any) => {
        this.isLoading = false;
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
  delPacket(data: any, loadingControl?: LoadingControl) {
    return new Promise((resole) => {
      const success = (result: any) => {
        loadingControl.loading = false;
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
        loadingControl.loading = false;
        this.message.create('error', JSON.stringify(err));
      };
      loadingControl.loading = true;
      this.standardCoursePkgService.delCourse(data.id, data.status).subscribe(success, error);
    });
  }

  @ConfirmableFlat({
      title: '课包复制',
      content: (args) => ('您确定复制' + args[0].name + '课包吗？'),
      type: 'confirm'
    }
  )
  copyPacket(data: any, loadingControl?: LoadingControl) {
    return new Promise((resole) => {
      loadingControl.loading = true;
      this.courseMgService.copy_coursePacket(data.id).subscribe((res) => {
        loadingControl.loading = false;
        if (res.status !== 201) {
          this.message.error(res.message);
          resole(false);
          return;
        }
        this.searchData();
        resole(true);
      }, () => loadingControl.loading = false);
    });
  }


  lessonBuy(data) {
    this.modalService.confirm({
      nzTitle: ((!data.isSale) || data.isSale === '0') ? '售卖' : '取消售卖',
      nzContent: ((!data.isSale) || data.isSale === '0') ? `确定将“${data.name}”课包投入网校进行售卖吗 ？`: `该课包正在网校售卖，确定取消售卖吗？`,
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
      nzTitle: data.isUsed === '1' ? '取消启用' : '启用',
      nzContent: (data.isUsed === '1' ? '取消启用后，教务将不能再对该课包进行新的排课！' : '确定将“' + data.name + '课包名称"课包投入使用吗？启用后不能再对课包结构 、总课次、智适应开启/关闭 进行修改。'),
      nzOkText: '确定',
      nzCancelText: '取消',
      nzOnOk: () => {
        return new Promise((resole) => {
          const isUsed = data.isUsed === '1' ? '2' : '1';
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
        return '面授';
      case '12':
        return '双师';
      case '21':
        return '直播';
      case '22':
        return '录播';
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
              this.curSchollData.opts.map(item => {
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
      this.curSchollData.opts.forEach(opts => {
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

  getAuditStatus(status: string) {
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
  }


  schoolZone(data) {
    this.curSchollData = data;
  }

  enterSeriesManagement() {
    this.menuService.gotoUrl({
      title: '系列管理',
      url: '/m/course-manage/series-management',
      paramUrl: '?courseId=' + this.selectedCourseVal
    });
  }


  seriesManagement() {
    return new Promise((resolve) => {
      this.courseMgService.coursePackageSeriesList({
        courseId: this.selectdCourse.courseId,
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

  // 获取课包版本号
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
    // if (!this.selectedCourseVal) {
    //   this.message.warning('请确保在一门课程下使用课包分组系类功能');
    //   return;
    // }
    this.selectdCourse = data;
    this.isSeriesNameLoading = true;
    this.fgGtoup.patchValue({
      series: data.courseSeriesId,
    });
    // 新增自动计算最新版本号
    if (!data.packetVer) {
      this.getTheVersionNumber(data).then((flag) => {
        this.expandTheBulletFrame(data);
      });
    } else {
      // 编辑回显版本号
      this.fgGtoup.patchValue({
        packetVer: data.packetVer
      });
      this.expandTheBulletFrame(data);
    }
  }

// 打开加入系列弹框
  expandTheBulletFrame(data) {
    // tslint:disable-next-line:forin
    for (const i in this.fgGtoup.controls) {
      this.fgGtoup.controls[i].markAsUntouched();
      this.fgGtoup.controls[i].markAsPristine();
      this.fgGtoup.controls[i].updateValueAndValidity();
    }
    // 获取课程下系列列表
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

  /**
   * 是否可以删除
   * @param data
   */
  delIf(data) { // '0':'草稿';'1''待审批';'2':'已通过';'3':'未通过';
    return data.auditStatus === '0' // 草稿
      || (data.status === '0' && data.auditStatus === '3') // 草稿下的未通过
      || (data.status === '1' && data.leaderId === this.userId && data.auditStatus !== '1' &&
        ((data?.isUsed === '0' || data?.isUsed === '2') && (data.isSale === '0' || data.isSale === '2')));  // 标准课包下课程负责人未启用和未售卖在已通过和未通过下
  }


  editIF(data) { // 课程组成员。课程负责人。专业负责人
    let flag = false;
    if (data.majorLeaderId) {
      flag = data.majorLeaderId.split(',').indexOf(this.userId) > -1;
    }
    if (!flag) {
      flag = data.leaderId === this.userId;
    }
    if (!flag) {
      if (data.courseTeamIds) {
        flag = data.courseTeamIds.split(',').indexOf(this.userId) > -1;
      }
    }
    return flag && this.approvalling(data);
  }

  // 不能删除提示语
  getDelCompetence(data: any) {
    if (!this.delIf(data)) {
      return '标准课包，只有课程负责人才权限删除 ，当课包处于已启用/已售卖时不可删除。';
    } else {
      return null;
    }
  }

  // 是否显示加入系列
  ifJoinTheSeries(data) {
    return data.status === '1'; // 标准课包ocodes
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

  // 非待审核
  approvalling(data) {
    return Number(data.auditStatus) !== 1;
  }

  private getCourseList() {
    return new Promise((resolve => {
      this.isCourseListLoading = true;
      this.courseMgService.getCourseListTree().subscribe(res => {
        this.isCourseListLoading = false;
        if (res.status === 200) {
          if (res.data.length) {
            this.courseList = [];
            this.courseListSelect = [];
            res.data.forEach(item => {
              if (item.courseList && item.courseList.length) {
                this.courseList = this.courseList.concat(item.courseList);
              }
            });
          } else {
            this.courseList = [];
          }
          this.courseListSelect = JSON.parse(JSON.stringify(this.courseList));
          this.courseListSelect.forEach(e => {
            this.courseMapId[e.id] = e.name;
            this.courseMapName[e.name] = e.id;
            this.courseMapMajorId[e.id] = e.majorId;
            this.courseMapCourseCode[e.id] = e.code;
          });
          this.courseList.unshift({id: '', name: '全部'});
          resolve(true);
          // if (this.selectedCourseVal) {
          //   resolve(true);
          // } else {
          //   if (this.courseList[0] && this.courseList[0].id) {
          //     // this.selectedCourseValue = this.selectedCourseVal = this.courseList[0].id;
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
        this.isCourseListLoading = false;
      });
    }));
  }

  history(data: any) {
    this.menuService.gotoUrl({
      url: '/m/course-manage/operation-log',
      title: '操作日志',
      paramUrl: '?pcode=' + data.pcode
    });
    // this.coursePackageHistoryVisibility = true;
  }

  initButton(data: any) {
    if (!data.upButtonArr) {
      const buttonArr = JSON.parse(JSON.stringify(BURRON_PACKETAGE));
      buttonArr.forEach(item => {
        if (typeof item.show === 'string') {
          item.show = this[item.show](data);
        }
      });
      data.upButtonArr = buttonArr.filter(item => item.show).slice(0, 3);
      data.dropButtonArr = buttonArr.filter(item => item.show).slice(3, BURRON_PACKETAGE.length);
    }
    return true;
  }

  statusIf(data) {
    return data.status === '1';
  }

  methodChange(data, i, key) {
    const method = data[key][i].method;
    const params = [data];
    this[method](...params);
  }

  feedbackStatistics(data: any) {
    this.menuService.gotoUrl({
      url: '/m/course-manage/feedback-statistics',
      title: '反馈统计',
      paramUrl: ''
    });
  }

  coursePackageOverview(data: any) {
    this.menuService.gotoUrl({
      url: '/m/course-manage/package-overview',
      title: '课包概况',
      paramUrl: ''
    });
  }

  joinSeriesJudgment(data) {
    return this.ifJoinTheSeries(data) && this.editIF(data);
  }

  showUse(data) {
    return data?.status === '1' && data?.leaderId === this.userId && this.approvalling(data);
  }

  getButtonTitle(button, data) {
    if (typeof button.title !== 'string') {
      return data[button.title[0]] === '1' ? '取消' + button.title[1] : button.title[1];
    } else {
      return button.title;
    }
  }

  getUseStatus(isUsed: string) {
    switch (isUsed) {
      case '0':
        return '未启用';
      case '1':
        return '已启用';
      case '2':
        return '已取消';
    }
  }



}
