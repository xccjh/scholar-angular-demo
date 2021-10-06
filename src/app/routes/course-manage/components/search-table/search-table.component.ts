import {Component, Inject, LOCALE_ID, OnDestroy, OnInit} from '@angular/core';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {CourseDataComponent} from '@app/routes/course-manage/components/course-data/course-data.component';
import {of, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, startWith} from 'rxjs/operators';
import {formatDate} from '@angular/common';
import {PAGE_CONSTANT} from 'core/base/static-data';

@Component({
  selector: 'app-search-table',
  template: ``
})
export class SearchTableComponent extends CourseDataComponent implements OnInit, OnDestroy {
  searchWordVal = '';
  dateRangeVal = [];
  selectedVal = '';
  subject: Subject<object> = new Subject<object>();

  constructor() {
    super();
  }

  ngOnInit() {
    this.subscribeChange();
    this.initData();
  }


  ngOnAttach() {
    this.collectParam();
    this.sybcParam();
    this.initData();
  }


  ngOnDestroy() {
    this.removeData();
    this.subject.unsubscribe();
  }


  initData() {
    this.searchData();
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

  getDate(createTime) {
    const now = new Date();
    const startTime = new Date(formatDate(now, 'yyyy-MM-dd 00:00:00', this.locale)).getTime();
    const endTime = new Date(formatDate(now, 'yyyy-MM-dd 23:59:59', this.locale)).getTime();
    if (createTime) {
      if (startTime < createTime && createTime < endTime) {
        return formatDate(createTime, 'HH:mm', this.locale);
      } else {
        return formatDate(createTime, 'yyyy-MM-dd', this.locale);
      }
    } else {
      return '--';
    }
  }


  resetData() {
    this.pageIndex = 1;
    this.resetInit();
    this.removeData();
    this.getDataList();
  }

  resetInit() {
    this.searchWord = '';
    this.dateRange = [];
    this.selectedValue = '';
    this.searchWordVal = '';
    this.dateRangeVal = [];
    this.selectedVal = '';
  }


  collectParam() {
    const {searchWordVal, dateRangeVal, selectedVal} = SessionStorageUtil.getSearch(this._PAGE_ID_);
    this.searchWordVal = searchWordVal || '';
    this.dateRangeVal = dateRangeVal || [];
    this.selectedVal = selectedVal || '';
  }

  sybcParam() {
    this.searchWord = this.searchWordVal;
    this.dateRange = this.dateRangeVal;
    this.selectedValue = this.selectedVal;
  }

  storingData() {
    const {selectedVal, dateRangeVal, searchWordVal} = this;
    this.passData({selectedVal, dateRangeVal, searchWordVal});
  }

  passData(value) {
    this.subject.next(value);
  }

  subscribeChange() {
    // distinctUntilChanged()
    this.subject.pipe(debounceTime(200)).subscribe((value) => {
      SessionStorageUtil.putSearch(this._PAGE_ID_, value);
    });
  }

  removeData() {
    SessionStorageUtil.clearSearch(this._PAGE_ID_);
  }

}
