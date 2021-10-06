import {Component, Inject, LOCALE_ID, OnInit, ViewChild} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {NzModalService, NzMessageService} from 'ng-zorro-antd';
import {AddEditComponent} from './add-edit/add-edit.component';
import {BatchUploadComponent} from './batch-upload/batch-upload.component';
import {ArchivesManageServer} from '@app/busi-services';
import {MenuService} from 'core/services/menu.service';
import {PAGE_CONSTANT} from 'core/base/static-data';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {environment} from 'src/environments/environment';
import {formatDate} from '@angular/common';
@Component({
  selector: 'app-guide-teacher',
  templateUrl: './guide-teacher.component.html',
  styleUrls: ['./guide-teacher.component.less']
})
export class GuideTeacherComponent implements OnInit {
  searchTeacherName = '';
  searchName = '';
  total = 0;
  tableList: any = [];
  pageIndex = PAGE_CONSTANT.page;
  pageSize = PAGE_CONSTANT.limit;
  isLoading = false;
  _PAGE_ID_ = 'GuideTeacherComponent';
  height = 0;
  limitHeight = 490; // 非表格区域高度
  isPreviewpolyway = false;
  resourceUrl;

  @ViewChild('addEditComponent') addEditComponent: AddEditComponent;
  @ViewChild('batchUploadComponent') batchUploadComponent: BatchUploadComponent;

  constructor(
    private msg: NzMessageService,
    public modalService: NzModalService,
    public httpServer: ArchivesManageServer,
    private menuService: MenuService,
    private sanitizer: DomSanitizer,
    @Inject(LOCALE_ID) public locale: string
  ) {
  }

  ngOnInit(): void {
    const self = this;
    const {searchName, pageIndex, pageSize} = SessionStorageUtil.getSearch(self._PAGE_ID_);
    if (searchName) {
      self.searchName = self.searchTeacherName = searchName;
    }
    if (pageIndex) {
      self.pageIndex = pageIndex;
    }
    if (pageSize) {
      self.pageSize = pageSize;
    }

    self.getLableListData('');
    self.setTableAutoHeight();
    window.onresize = () => self.throttle(self.setTableAutoHeight, self);
  }


  getDate(createTime) {
    const now = new Date();
    const startTime = new Date(formatDate(now, 'yyyy-MM-dd 00:00:00', this.locale)).getTime();
    const endTime = new Date(formatDate(now, 'yyyy-MM-dd 23:59:59', this.locale)).getTime();
    if (createTime) {
      if (startTime < createTime && createTime < endTime) {
        return formatDate(createTime, 'HH:mm:ss', this.locale);
      } else {
        return formatDate(createTime, 'yyyy-MM-dd', this.locale);
      }
    } else {
      return '--';
    }
  }

  throttle(method, context) {
    clearTimeout(method.tId);
    method.tId = setTimeout(() => method.call(context), 10);
  }

  setTableAutoHeight() {
    this.height = document.body.clientHeight - this.limitHeight;
  }

  resetQuery() {
    this.searchTeacherName = '';
    this.searchName = '';
    SessionStorageUtil.putSearch(this._PAGE_ID_, {
      searchName: '',
      pageIndex: this.pageIndex,
      pageSize: this.pageSize
    });
  }

  getLableListData(type?: string): void {
    const self = this;
    if (type === 'changeList') {
      self.searchTeacherName = '';
      self.searchName = '';
      self.pageIndex = 1;
    }
    const {pageIndex, pageSize, searchTeacherName} = self;
    console.log(pageIndex, pageSize, searchTeacherName, '获取表单列表');
    const parpms = {
      limit: pageSize,
      page: pageIndex,
      sort: 'createTime|desc',
      name: searchTeacherName
    };
    self.isLoading = true;
    self.httpServer.guideTeacherTableList(parpms).subscribe(res => {
      self.isLoading = false;
      if (!res) {
        return;
      }
      self.tableList = res.data;
      // 请注意tslint的问题
      // tslint:disable-next-line:no-unused-expression
      res.page && (self.total = res.page.totalResult);
    }, () => {
      self.isLoading = false;
    });
  }

  // 用户操作
  handleInputSearch() {
    // 保存到内存 下次进来获取
    SessionStorageUtil.putSearch(this._PAGE_ID_, {
      searchName: this.searchName,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize
    });
  }

  handleSearch(): void {
    this.pageIndex = 1;
    this.searchTeacherName = this.searchName;
    this.getLableListData('');
  }

  handleAddRow(): void {
    this.addEditComponent.createFormModal({title: '新增指导讲师', httpServer: this.httpServer});
  }

  handleTableRowEdit(row): void {
    // console.log(row, 'row');
    this.addEditComponent.createFormModal({title: '编辑指导讲师', httpServer: this.httpServer, row});
  }

  handleTablePreview(row) {
    this.menuService.gotoUrl({url: '/m/archives-manage/teacher-preview', paramUrl: `/${row.id}`, title: '老师详情'});
  }

  handlepreVideo(id) {
    // https://share.plvideo.cn/front/video/preview?vid=a647f95e6e5de11f5a42c29ba374b91d_a
    if (!id) { return this.msg.warning('抱歉, 当前id为空, 无法观看'); }
    this.isPreviewpolyway = true;
    this.resourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      environment.ow365.substr(0, environment.ow365.length - 5) + 'polywayId=' + id
    );
    // this.menuService.gotoUrl({url: '/m/archives-manage/video-preview', paramUrl: `/${id}`, title: '视频预览'});
  }

  handleBatchUpload(): void {
    this.batchUploadComponent.createUploadModal({httpServer: this.httpServer});
  }

  handleTableRowDel(row): void {
    console.log(row);
    const self = this;
    this.modalService.warning({
      nzTitle: '提示',
      nzContent: '确认删除吗? ',
      nzCancelText: '取消',
      nzOnOk: () => {
        console.log('删除');
        const params = {
          id: row.id
        };
        self.httpServer.guideTeacherDel(params).subscribe((res) => {
          self.getLableListData('');
        });
      }
    });
  }

  handleSearchData(reset = false): void {
    // 分页
    // 请注意tslint的问题
    // tslint:disable-next-line:no-unused-expression
    reset && (this.pageIndex = 1);
    this.handleInputSearch();
    this.getLableListData('');
  }

}
