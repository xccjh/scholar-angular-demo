import {Component, Inject, LOCALE_ID, TemplateRef, ViewChild} from '@angular/core';
import {MenuService} from 'core/services/menu.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ToolsUtil} from 'core/utils/tools.util';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {SearchTableComponent} from '../components';
import {formatDate} from '@angular/common';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {Encrypt} from 'core/utils/crypto';
import {ClipboardService} from 'ngx-clipboard';
import {PacketInfo} from 'core/base/common';
import {ConfirmableFlat} from 'core/decorators';


@Component({
  selector: 'app-iapproved',
  templateUrl: './iapproved.component.html',
  styleUrls: ['./iapproved.component.less']
})
export class IapprovedComponent extends SearchTableComponent {
  _PAGE_ID_ = 'IapprovedComponent';
  id = -1;
  modalForm: FormGroup;
  modalFormRef: NzModalRef;
  isVisible = false;
  visible = false;
  orgCode = ToolsUtil.getOrgCode();
  fg: FormGroup;
  userId = LocalStorageUtil.getUserId();
  curdata: any;
  isShareVisible: any;
  shareLink: any;
  verificationCode: any;
  approveAllLoading = false;
  indeterminate = false;
  checked = false;
  loading = false;
  listOfCurrentPageData: ReadonlyArray<any> = [];
  setOfCheckedId = new Set<number>();
  private currentData: any; // 当前课包

  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  @ViewChild('modalCheck') modalCheck: TemplateRef<any>;


  constructor(
    private fb: FormBuilder,
    private modalService: NzModalService,
    private menuService: MenuService,
    private clipboardService: ClipboardService,
    public message: NzMessageService,
    public courseMgService: CourseManageService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    super();
  }

  /*
  * @Override
  * @*/
  getDataList(): void {
    this.isLoading = true;
    const param: any = {
      name: this.searchWord.trim(),
      auditStatus: '1,2,3',
      createTimeStart: '',
      createTimeEnd: '',
      limit: this.pageSize,
      page: this.pageIndex,
      orgCode: this.orgCode,
      finalApproverId: LocalStorageUtil.getUserId()
    };
    if (this.dateRange.length) {
      param.createTimeStart = formatDate(this.dateRange[0], 'yyyy-MM-dd', this.locale);
      param.createTimeEnd = formatDate(this.dateRange[1], 'yyyy-MM-dd', this.locale);
    }
    this.courseMgService.getPkgList(param).subscribe(res => {
      this.isLoading = false;
      if (res.status !== 200) {
        this.message.error(res.message);
        return;
      }
      this.data = res.data;
      this.total = res.page.totalResult;
    }, err => {
      this.isLoading = false;
      this.message.error(JSON.stringify(err));
    });
  }


  submitForApproval(data: any) {
    this.curdata = data;
    this.modalFormRef = this.modalService.create({
      nzTitle: '提交审批',
      nzContent: this.modalCheck,
      nzMaskClosable: false,
      nzWrapClassName: 'vertical-center-modal',
      nzFooter: null
    });
  }

  approveAll(data, type) {
    if (data) {
      const param = {
        id: data.id,
        auditStatus: type
      };
      this.approveAllLoading = true;
      this.courseMgService.submitForApproval(param).subscribe(res => {
        this.approveAllLoading = false;
        if (res.status === 201) {
          this.searchData(true);
          this.modalFormRef.destroy();
        } else if (res.status === 500) {
          this.message.error('服务端业务异常');
        }
      }, () => this.approveAllLoading = false);
    }
  }

  goPrepare(item: PacketInfo, preview?: boolean): void {
    SessionStorageUtil.putPacketInfo(item, preview);
    SessionStorageUtil.clearChapterSelection();
    // this.menuService.gotoUrl({
    //   title: '课包预览',
    //   url: '/m/course-manage/prepare-course',
    //   paramUrl: '',
    // });
    if (item.teachType === '22') {
      open(window.location.href.split('#')[0] + '#/o/outline');
    } else {
      open(window.location.href.split('#')[0] + '#/of/outline-fl');
    }
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
        return '已通过';
      case '3':
        return '未通过';
      case '4':
        return '撤回';
      default :
        return '未知';
    }
  }

  showCheck(data: any) {
    if (this.orgCode === 'zksd') {
      if (data.finalApproverId) {
        const arr = data.finalApproverIds.split(',');
        if (arr.indexOf(this.userId) > -1 && data.auditStatus === '1') {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return data.auditStatus === '1' && data.finalApproverId === this.userId;
    }
  }

  share(data: any) {
    this.currentData = data;
    this.refreshCode();
    this.isShareVisible = true;
  }


  refreshCode() {
    const {currentData} = this;
    const prexUrl = location.origin + (process.env.environment !== 'development' ? '/scholar/?' : '/?') +
      ToolsUtil.getOrgCode() + '#/p/';
    const realUrl = currentData.teachType === '22' ? 'o/outline' : 'of/outline-fl';
    const expireDate = (new Date().getTime()) + 15 * 24 * 60 * 60 * 1000;

    const lessonCount = currentData.lessonCount || '1';
    const isSmart = currentData.isSmart || '0';
    const auditStatus = currentData.auditStatus || '0';
    const {id, name, status, teachType, createrId, pcode, majorId, courseId, courseCode, majorLeaderId, knowledgeSubjectId} = currentData;
    const packInfo = {
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
      pcode,
      majorLeaderId,
      knowledgeSubjectId
    };
    const user = LocalStorageUtil.getUser();
    this.verificationCode = Math.random().toString(36).substring(2).substr(0, 6);
    const secretUrl = Encrypt((expireDate + '@' + user.userName + '@' + user.password), this.verificationCode);
    // + '/' + packInfo.professionId + '/' + packInfo.courseId
    // tslint:disable-next-line:max-line-length
    const realUrls = realUrl + '/' + packInfo.pcode + '/';
    // console.log(Encrypt((realUrls), this.verificationCode));
    // console.log(Encrypt((lzw_compress(realUrls)), this.verificationCode));
    // console.log(encodeURIComponent(secretUrl));
    this.shareLink = prexUrl + realUrls + encodeURIComponent(secretUrl);
    // const restoreAddress = Decrypt(decodeURIComponent(secretUrl), this.verificationCode);
  }


  closeShareModal() {
    this.isShareVisible = false;
    this.shareLink = '';
    this.verificationCode = '';
  }

  copyLinkAndVerificationCode() {
    const copyContent =
      `链接：${this.shareLink}

验证码:${this.verificationCode}

`;
    this.clipboardService.copy(copyContent);
    this.message.info('复制成功');
  }

  delIf(data: any) {
    return String(data.status) !== '99';
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageData.filter(({auditStatus}) => (auditStatus === '1'));
    this.checked = listOfEnabledData.every(({id}) => this.setOfCheckedId.has(id));
    this.indeterminate = listOfEnabledData.some(({id}) => this.setOfCheckedId.has(id)) && !this.checked;
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listOfCurrentPageData.filter(({auditStatus}) => (auditStatus === '1'))
      .forEach(({id}) => this.updateCheckedSet(id, checked));
    this.refreshCheckedStatus();
  }

  onCurrentPageDataChange(listOfCurrentPageData: ReadonlyArray<any>): void {
    this.listOfCurrentPageData = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }

  /**
   * @overide
   */
  searchData(reset: boolean | string = false) {
    super.searchData(reset);
    this.checked = false;
    this.indeterminate = false;
    this.listOfCurrentPageData = [];
    this.setOfCheckedId = new Set<number>();
  }

  @ConfirmableFlat({
      title: '批量审批',
      content() {
        return `

课包审批通过后，可进入教务排课与网校销售阶段。
<br/> <br/> 确定审批选中的${this.data.filter(data => this.setOfCheckedId.has(data.id)).map(item => item.id).length}项？`;
      },
      type: 'confirm',
      nzOkText: '通过',
      nzCancelText: '不通过',
      nzOnCancel(): Promise<boolean> {
        return this.approvBatch(3);
      },
    }
  )
  approvBatchPre() {
    return this.approvBatch(2);
  }

  approvBatch(auditStatus: 2 | 3): Promise<boolean> {
    return new Promise((resolve) => {
      const requestData = this.data.filter(data => this.setOfCheckedId.has(data.id)).map(item => item.id);
      this.courseMgService.batchApprovalPkg({
        ids: requestData,
        auditStatus
      }).subscribe(res => {
        if (res.status === 201) {
          resolve(true);
          this.searchData('button');
        } else {
          resolve(false);
        }
      }, () => {
        resolve(false);
      });
    });

  }
}
