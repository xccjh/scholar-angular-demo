import {Component, Inject, LOCALE_ID} from '@angular/core';
import {CourseListParams} from 'core/base/common';
import {formatDate} from '@angular/common';
import {FlexTableComponent} from '../flex-table/flex-table.component';
import {PAGE_CONSTANT} from 'core/base/static-data';

@Component({
  selector: 'app-course-data',
  template: ``
})
export class CourseDataComponent extends FlexTableComponent {
  pageIndex = PAGE_CONSTANT.page;
  pageSize = PAGE_CONSTANT.limit;
  searchWord = '';
  selectedValue = '';
  dateRange = [];
  data = [];
  total = 0;
  isLoading = false;
  _PAGE_ID_;
  courseMgService;
  message;
  route;
  locale;


  constructor() {
    super();
  }

  getDataList() {
    this.isLoading = true;
    const type = this.route.routeConfig.path;
    const param: CourseListParams = {
      page: this.pageIndex,
      limit: this.pageSize,
      searchKey: this.searchWord.trim(),
      auditStatus: this.selectedValue || '',
      filterKey: 'MANAGER',

    };
    if (type === 'course-list') {
      param.startTime = '';
      param.endTime = '';
      if (this.dateRange.length) {
        param.startTime = formatDate(this.dateRange[0], 'yyyy-MM-dd', this.locale);
        param.endTime = formatDate(this.dateRange[1], 'yyyy-MM-dd', this.locale);
      }
    } else {
      param.startBillDate = '';
      param.endBillDate = '';
      if (this.dateRange.length) {
        param.startBillDate = formatDate(this.dateRange[0], 'yyyy-MM-dd', this.locale);
        param.endBillDate = formatDate(this.dateRange[1], 'yyyy-MM-dd', this.locale);
      }
      if (type === 'i-initiated') {
        param.queryFilterType = 'I_STARTED';
      } else if (type === 'approve-all') {
        param.queryFilterType = 'ALL_APPROVED';
      }
    }

    this.courseMgService.getCourseListNew(param).subscribe(res => {
      this.isLoading = false;
      if (res.status !== 200) {
        this.message.error(res.message);
        return;
      }
      this.data = res.data || [];
      this.total = res.page ? res.page.totalResult : 0;
    }, err => {
      this.isLoading = false;
      this.message.error(JSON.stringify(err));
    });
  }


}
