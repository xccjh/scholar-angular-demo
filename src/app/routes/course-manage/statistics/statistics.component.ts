import {Component, Inject, LOCALE_ID, OnInit} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {FormBuilder} from '@angular/forms';
import {NzModalService} from 'ng-zorro-antd';
import {MenuService} from 'core/services/menu.service';
import {SearchTableComponent} from '../components';
import {ActivatedRoute} from '@angular/router';
import {CourseManageService} from '@app/busi-services';
import {HttpHeaders, HttpResponse} from '@angular/common/http';


@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.less'],
})
export class StatisticsComponent extends SearchTableComponent {
  _PAGE_ID_ = 'StatisticsComponent';
  code: string;
  difficult = 0;
  medium = 0;
  easy = 0;
  numberOfExercises = 0;
  knowledgePoints = 0;
  moreDifficult = 0;
  moreEasy = 0;
  exportLoading = false;

  constructor(
    private fb: FormBuilder,
    private modalService: NzModalService,
    private menuService: MenuService,
    public courseMgService: CourseManageService,
    public message: NzMessageService,
    public route: ActivatedRoute,
    @Inject(LOCALE_ID) public locale: string
  ) {
    super();
    this.code = this.route.snapshot.queryParamMap.get('code');
  }

  /*
  * @Override
  * @*/
  getDataList(): void {
    this.isLoading = true;
    this.courseMgService.getStatistics({
      courseCode: this.code,
      searchKey: this.searchWord,
      questionNum: this.selectedValue || '全部',
      page: this.pageIndex,
      limit: this.pageSize,
    }).subscribe(res => {
      this.isLoading = false;
      if (res.status === 200) {
        const {total, list} = res.data;
        if (total) {
          const {
            totalEasyNum, totalHardNum, totalKnowledgePointNum,
            totalMiddleNum, totalQuestionNum, totalMoreEasyNum, totalMoreHardNum
          }
            = res.data.total;
          this.difficult = totalHardNum || 0;
          this.medium = totalMiddleNum || 0;
          this.easy = totalEasyNum || 0;
          this.moreDifficult = totalMoreHardNum || 0;
          this.moreEasy = totalMoreEasyNum || 0;
          this.numberOfExercises = totalQuestionNum || 0;
          this.knowledgePoints = totalKnowledgePointNum || 0;
        }
        this.data = (list && list.data) || [];
        this.total = (list && list.totalSize) || 0;
      }
    }, () => this.isLoading = false);
  }

  goback() {
    this.menuService.goBack(false);
    this.menuService.gotoUrl({
      url: '/m/course-manage/course-list',
      paramUrl: '',
      title: '课程管理'
    });
  }


  export() {
    this.exportLoading = true;
    this.courseMgService.exportExcelCourse(this.code).subscribe((resp: HttpResponse<Blob>) => {
      this.exportLoading = false;
      const headers: HttpHeaders = resp.headers;
      // (window as any).aa=headers.get('content-disposition').split('=')[1];
      // console.log(headers.get('content-disposition').split('=')[1]);
      const link = document.createElement('a');
      // 支持HTML5下载属性的浏览器
      const url = URL.createObjectURL(resp.body);
      link.setAttribute('href', url);
      link.setAttribute('download', '课程数据统计.xls');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
}
