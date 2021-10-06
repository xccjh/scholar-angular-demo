import {Component, Inject, LOCALE_ID, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NzMessageService, NzModalRef, NzModalService} from 'ng-zorro-antd';
import {ToolsUtil} from 'core/utils/tools.util';
import {KnowledgeManageService} from 'src/app/busi-services/knowledge-manag.service';
import {spaceValidator} from 'src/app/shared/validators/atr-validtors';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {formatDate} from '@angular/common';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {MenuService} from 'core/services/menu.service';
import {Json, ProfessionalParams} from 'core/base/common';
import {SearchTableComponent} from '../../course-manage/components';
import {ConfirmableFlat} from 'core/decorators';
import {LoadingControl} from 'core/base/common';

@Component({
  selector: 'app-profession-list',
  templateUrl: './profession-list.component.html',
  styleUrls: ['./profession-list.component.less'],
  providers: [KnowledgeManageService]
})
export class ProfessionListComponent extends SearchTableComponent implements OnInit {
  _PAGE_ID_ = 'ProfessionListComponent';
  modalForm: FormGroup;
  transferSubjectsVisible = false;
  modalFormRef: NzModalRef;
  editData: Json = {};
  allLine = [];
  orgCode = ToolsUtil.getOrgCode();
  userId = LocalStorageUtil.getUserId();
  islineProductLoading = false;
  subjectsManager = '';
  isManager: any = '0';
  isModalLoading = false; // 新增/编辑
  @ViewChild('modalContent') modalContent: TemplateRef<any>;

  constructor(
    private fb: FormBuilder,
    private modalService: NzModalService,
    private knowledgeManageService: KnowledgeManageService,
    private menuService: MenuService,
    public message: NzMessageService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    super();
    this.initializeForm();
    this.judgmentAuthority();
  }

  /*
  * @Override
  * @*/
  getDataList() {
    const param: ProfessionalParams = {
      page: this.pageIndex,
      limit: this.pageSize,
      orgCode: ToolsUtil.getOrgCode(),
      searchKey: this.searchWord.trim(),
      startTime: '',
      endTime: '',
      filterKey: 'MANAGER'
    };

    if (this.dateRange.length) {
      param.startTime = formatDate(this.dateRange[0], 'yyyy-MM-dd', this.locale);
      param.endTime = formatDate(this.dateRange[1], 'yyyy-MM-dd', this.locale);
    }

    this.isLoading = true;
    const success = (res) => {
      this.isLoading = false;
      if (res.status === 200) {
        this.data = res.data;
        this.total = res.page.totalResult;
      } else {
        this.message.error(JSON.stringify(res));
      }
    };

    const error = (err) => {
      this.isLoading = false;
      this.message.error(JSON.stringify(err));
    };
    this.knowledgeManageService.searchMajor(param).subscribe(success, error);
  }

  private makeFormDirty(): void {
    // tslint:disable-next-line:forin
    for (const i in this.modalForm.controls) {
      this.modalForm.controls[i].markAsDirty();
      this.modalForm.controls[i].updateValueAndValidity();
    }
  }

  private initializeForm(): void {
    // , Validators.maxLength(15)
    this.modalForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required, spaceValidator(), Validators.maxLength(25)]],
      leaderId: ['', [Validators.required]],
      // managerId : [this.userId, [Validators.required]],
      finalApproverId: ['', [Validators.required]], //  终审人
      majorType: [''],  // 学科类型
      productLineId: ['', [Validators.required]], // 产品线
      // seq: [1],
    });
  }

  private initializeFormFieldState(): void {
    // tslint:disable-next-line:forin
    for (const i in this.modalForm.controls) {
      this.modalForm.controls[i].markAsUntouched();
      this.modalForm.controls[i].markAsPristine();
      this.modalForm.controls[i].updateValueAndValidity();
    }
  }

  private showModal(data) {
    const operate = data ? '编辑' : '新增';
    this.modalFormRef = this.modalService.create({
      nzTitle: this.orgCode === 'zksd' ? `${operate}专业` : `${operate}学科`,
      nzContent: this.modalContent,
      nzMaskClosable: false,
      nzBodyStyle: {paddingBottom: '0px'},
      nzWrapClassName: 'vertical-center-modal',
      nzAutofocus: null,
      nzFooter: [{
        label: '取消',
        onClick: () => this.modalFormRef.destroy()
      }, {
        label: '保存',
        autoLoading: true,
        loading: () => this.isModalLoading,
        type: 'primary',
        onClick: () => this.confirm()
      }],
    });
  }

  private restoreFormData(data: any) {
    if (data) {
      this.modalForm.patchValue({
        id: data.id,
        name: data.name,
        leaderId: data.leaderId,
        finalApproverId: data.finalApproverId, //  终审人
        majorType: data.majorType,  // 学科类型
        productLineId: data.productLineId, // 产品线
        // managerId: data.managerId
        // seq: data.seq
      });
    } else {
      this.modalForm.patchValue({
        id: '',
        name: '', // 学科名称
        leaderId: null, // 负责人
        finalApproverId: null, //  终审人
        majorType: '',  // 学科类型
        productLineId: '', // 产品线
        // managerId: this.userId
        // seq: 1
      });
    }
  }

  /**
   * 获取所有产品线
   */
  private getAllLine(): void {
    this.islineProductLoading = true;
    this.knowledgeManageService.getAllLine().subscribe(
      result => {
        this.islineProductLoading = false;
        if (result.status === 200) {
          this.allLine = result.data;
        }
      },
      error => {
        this.islineProductLoading = false;
      }
    );
  }


  /**
   * 教研总管
   */
  private judgmentAuthority() {
    this.menuService.loadMenus().subscribe((ret) => {
      if (ret.length) {
        if (ret[0].children && ret[0].children.length) {
          const flag = ret[0].children.every(ee => {
            if (ee.text === '教研总管') {
              this.isManager = '1';
            } else {
              return true;
            }
          });
          if (flag) {
            this.isManager = '0';
          }
        }
      }
    });
  }


  /**
   *  新增编辑专业弹框
   * @param data 专业item
   */
  showProfessionModal(data?): void {
    this.getAllLine();
    this.restoreFormData(data);
    this.initializeFormFieldState();
    this.showModal(data);
  }


  confirm() {
    return new Promise((resolve, reject) => {
      this.makeFormDirty();
      if (this.modalForm.invalid) {
        resolve(false);
        return;
      }
      const success = (res) => {
        if (res.status === 201) {
          this.modalFormRef.destroy();
          this.pageIndex = 1;
          this.searchData();
          this.isModalLoading = false;
          resolve(true);
        } else {
          this.isModalLoading = false;
          resolve(false);
        }
      };
      const error = (err) => {
        this.isModalLoading = false;
        resolve(false);
      };
      this.isModalLoading = true;
      const postData = JSON.parse(JSON.stringify(this.modalForm.value));
      if (postData.majorType === '1') {
        postData.majorTypeName = '财会证书';
      } else {
        postData.majorTypeName = '会计实操';
      }
      postData.managerId = this.userId;
      this.knowledgeManageService.saveMajor(postData).subscribe(success, error);
    });
  }

  @ConfirmableFlat({
    type: 'error',
    title: '删除',
    content() {
      const label = this.orgCode === 'zksd' ? '专业' : '学科';
      return `删除该${label}后，该${label}下的课程 、课包将进行同步删除。确定删除该${label}吗？`;
    },
  })
  del(data: any, loadingControl?: LoadingControl) {
    return new Promise(resolve => {
      loadingControl.loading = true;
      this.knowledgeManageService.delMajor({id: data.id}).subscribe((res) => {
        loadingControl.loading = false;
        if (res.status === 204) {
          resolve(true);
          this.searchData();
        } else if (res.status === 500) {
          this.message.error('服务器业务异常');
          resolve(false);
        }
      }, () => {
        loadingControl.loading = false;
        resolve(false);
      });
    });
  }

  transferSubjects(data) {
      this.transferSubjectsVisible = true;
      this.editData = data;
      this.subjectsManager = data.managerId || this.userId;
  }

  transferOk() {
      if (!this.subjectsManager) {
        this.message.warning('请填写学科管理人！');
        return;
      }
      this.handleOk();
  }


  @ConfirmableFlat({
    type: 'warning',
    title: '移交学科',
    content() {
      return `确定要将学科移交给他人吗？`;
    },
  })
  handleOk() {
    const success = (res) => {
      if (res.status === 201) {
        this.pageIndex = 1;
        this.transferSubjectsVisible = false;
        this.searchData();
        this.isModalLoading = false;
      } else {
        this.isModalLoading = false;
      }
    };
    const error = (err) => {
      this.isModalLoading = false;
    };
    const  {finalApproverId, leaderId,  name, productLineId} = this.editData;
    this.knowledgeManageService.saveMajor({
      id: this.editData.id,
      finalApproverId,
      leaderId,
      name,
      productLineId,
      managerId: this.subjectsManager}).subscribe(success, error);
  }
}
