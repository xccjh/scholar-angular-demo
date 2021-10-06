import {Component, OnDestroy, OnInit} from '@angular/core';
import {SearchTableComponent} from '@app/routes/course-manage/components/search-table/search-table.component';
import {map} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {ToolsUtil} from 'core/utils/tools.util';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';

@Component({
  selector: 'app-course-data',
  template: ``
})

export class ResolverDataComponent extends SearchTableComponent implements OnDestroy {
  pageIndex;
  data$: Subscription;


  constructor(public route: ActivatedRoute) {
    super();
  }

  /*
 * @Override
 * */
  initData() {
    this.data$ = this.route.data.pipe(map(res => res.courseListData)).subscribe((ret) => {
      const res = ret[0];
      this.data = res.data || [];
      this.total = res.page ? res.page.totalResult : 0;
    });
  }

  ngOnDetach() {
    SessionStorageUtil.putPageInfo(this._PAGE_ID_, JSON.stringify({
      page: this.pageIndex,
      limit: this.pageSize
    }));
    this.data$.unsubscribe();
  }

  /*
  * @Overide
  * */
  ngOnDestroy() {
    super.ngOnDestroy();
    SessionStorageUtil.removePageInfo(this._PAGE_ID_);
  }

}
