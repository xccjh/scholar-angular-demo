import {Component, Inject, LOCALE_ID} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {CourseManageService} from '@app/busi-services';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {spaceValidator} from '@app/shared/validators/atr-validtors';
import {SearchTableComponent} from '@app/routes/course-manage/components';
import {ActivatedRoute} from '@angular/router';
import {MenuService} from 'core/services/menu.service';
import {ConfirmableFlat} from 'core/decorators';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {NzModalService} from 'ng-zorro-antd';
import {LoadingControl} from 'core/base/common';


@Component({
  selector: 'app-standard-course-pkg-list',
  templateUrl: './series-management.component.html',
  styleUrls: ['./series-management.component.less'],
})
export class SeriesManagementComponent extends SearchTableComponent {
  _PAGE_ID_ = 'SeriesManagementComponent';
  addSeriesVisibility = false;
  labels = [];
  fgLabel: FormGroup;
  currentLabel: any = {};
  coursePacketId: any;
  isAddLoading = false;
  edit = false;
  courseList = [];
  selectedCourseVal = '';
  selectedCourseValue = '';

  constructor(
    private menuService: MenuService,
    private modalService: NzModalService,
    private fb: FormBuilder,
    public courseMgService: CourseManageService,
    public message: NzMessageService,
    public route: ActivatedRoute,
    @Inject(LOCALE_ID) public locale: string,
  ) {
    super();
    this.fgLabel = this.fb.group({
      name: ['', [Validators.required, spaceValidator(), Validators.maxLength(25)]],
      ruleType: ['', [Validators.required]],
      selectedCourse: ['', [Validators.required]],
    });
  }

  /*
 * @Override
 * */
  initData(): void {
    const {courseId} = this.route.snapshot.queryParams;
    this.selectedCourseVal = courseId;
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
    this.selectedCourseVal = '';
    this.selectedCourseValue = '';
  }

  /*
  * @Override
  * */
  collectParam() {
    const {selectedCourseVal} = SessionStorageUtil.getSearch(this._PAGE_ID_);
    this.selectedCourseVal = selectedCourseVal || '';
  }

  /*
  * @Override
  * */
  sybcParam() {
    this.selectedCourseValue = this.selectedCourseVal;
  }

  /*
  * @Override
  * */
  storingData() {
    const {selectedCourseVal} = this;
    this.passData({selectedCourseVal});
  }

  /*
  * @Override
  * @*/
  getDataList() {
    return new Promise((resolve) => {
      this.courseMgService.coursePackageSeriesList({
        courseId: this.selectedCourseVal,
        page: this.pageIndex,
        limit: this.pageSize
      }).subscribe(res => {
        if (res.status === 200) {
          this.labels = res.data;
          this.labels.forEach((resP, i) => {
            resP.seqFont = (this.pageIndex - 1) * this.pageSize + (i + 1);
          });
          this.total = res.page.totalResult;
        }
        resolve(this.labels);
      }, err => {
        this.message.error(err.message);
        resolve(this.labels);
      });
    });
  }

  private getCourseList() {
    return new Promise((resolve => {
      this.courseMgService.getCourseListTree().subscribe(res => {
        if (res.status === 200) {
          if (res.data.length) {
            this.courseList = [];
            res.data.forEach(item => {
              if (item.courseList && item.courseList.length) {
                this.courseList = this.courseList.concat(item.courseList);
              }
            });
          } else {
            this.courseList = [];
          }
          if (!this.selectedCourseVal) {
            if (this.courseList[0] && this.courseList[0].id) {
              this.selectedCourseVal = this.courseList[0].id;
              resolve(true);
            } else {
              this.message.error('未检测到有你的课程，请先新建课程后再进行系列管理操作！');
              resolve(false);
            }
          } else {
            resolve(true);
          }
        } else {
          resolve(false);
        }
      }, () => {
        resolve(false);
      });
    }));
  }


  addSeries() {
    this.edit = false;
    this.currentLabel = {};
    this.fgLabel.patchValue({
      name: '',
      ruleType: ''
    });
    // tslint:disable-next-line:forin
    for (const i in this.fgLabel.controls) {
      this.fgLabel.controls[i].markAsUntouched();
      this.fgLabel.controls[i].markAsPristine();
      this.fgLabel.controls[i].updateValueAndValidity();
    }
    this.addSeriesVisibility = true;
  }

  // 找出数组所有匹配的索引
  findall(a, x) {
    const results = [];
    const len = a.length;
    let pos = 0;
    while (pos < len) {
      pos = a.indexOf(x, pos);
      if (pos === -1) {// 未找到就退出循环完成搜索
        break;
      }
      results.push(pos); // 找到就存储索引
      pos += 1; // 并从下个位置开始搜索
    }
    return results;
  }

  addLabel() {
    if (this.checkLabel()) {
      return;
    }
    const nameArr = this.labels.map((item) => item.name);
    if (this.edit) {
      const currentIndex = this.labels.findIndex(e => e.name === this.currentLabel.name);
      const allIndexArr = this.findall(nameArr, this.fgLabel.value.name);
      const allIndexArrfilter = allIndexArr.filter(e => e !== currentIndex);
      if (allIndexArrfilter.length > 0) {
        this.message.warning('该课程下已存在同名系列');
        return;
      }
    } else {
      if (nameArr.indexOf(this.fgLabel.value.name) > -1) {
        this.message.warning('该课程下已存在同名系列');
        return;
      }
    }
    this.isAddLoading = true;
    const params: any = {
      courseId: this.fgLabel.value.selectedCourse,
      name: this.fgLabel.value.name,
      ruleType: this.fgLabel.value.ruleType
    };
    if (this.currentLabel.id) {
      params.id = this.currentLabel.id;
    }
    this.courseMgService.addLabel(params).subscribe(res => {
      if (res.status === 201) {
        if (!this.edit) {
          this.pageIndex = 1;
        }
        this.selectedCourseVal = this.fgLabel.value.selectedCourse;
        this.getDataList().then(() => {
          this.addSeriesVisibility = false;
          this.isAddLoading = false;
        });
      } else {
        this.isAddLoading = false;
      }
    }, error => {
      this.isAddLoading = false;
    });
  }

  checkLabel() {
    Object.keys(this.fgLabel.controls).forEach((control) => {
      this.fgLabel.controls[control].markAsDirty();
      this.fgLabel.controls[control].updateValueAndValidity();
    });
    if (this.fgLabel.invalid) {
      return true;
    }
  }

  @ConfirmableFlat({
      title: '删除',
      content: '删除该系列会导致该系列下的所有课包进行解绑，确定删除吗？',
      type: 'error'
    }
  )
  labelDel(id, loadingControl?: LoadingControl) {
    return new Promise((resolve) => {
      this.isLoading = loadingControl.loading = true;
      this.courseMgService.delLabel({id}).subscribe((res) => {
        if (res.status === 204) {
          this.getDataList();
          resolve(true);
        } else {
          resolve(false);
        }
        this.isLoading = loadingControl.loading = false;
      }, error => {
        resolve(false);
        this.isLoading = loadingControl.loading = false;
      });
    });
  }

  labelEdit(item) {
    this.edit = true;
    this.fgLabel.patchValue({
      name: item.name,
      ruleType: item.ruleType,
      selectedCourse: item.courseId
    });
    // tslint:disable-next-line:forin
    for (const i in this.fgLabel.controls) {
      this.fgLabel.controls[i].markAsUntouched();
      this.fgLabel.controls[i].markAsPristine();
      this.fgLabel.controls[i].updateValueAndValidity();
    }
    this.currentLabel = item;
    this.addSeriesVisibility = true;
  }


  goback() {
    this.menuService.goBack(false);
    this.menuService.gotoUrl({
      url: '/m/course-manage/scp-list',
      paramUrl: '',
      title: '课包'
    });
  }

  getRuleType(ruleType: any) {
    switch (ruleType) {
      case '1':
        return '自由排课';
      case '2':
        return '只升不降';
      default:
        return '--';
    }
  }
}
