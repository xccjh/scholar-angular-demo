import {Component, Inject, LOCALE_ID, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NzMessageService, NzModalRef, NzModalService} from 'ng-zorro-antd';
import {ToolsUtil} from 'core/utils/tools.util';
import {KnowledgeManageService} from 'src/app/busi-services/knowledge-manag.service';
import {spaceValidator} from 'src/app/shared/validators/atr-validtors';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {formatDate} from '@angular/common';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {ProfessionalParams} from 'core/base/common';
import {SearchTableComponent} from '../../course-manage/components';

@Component({
  selector: 'app-announcement-management',
  templateUrl: './announcement-management.component.html',
  styleUrls: ['./announcement-management.component.less']
})
export class AnnouncementManagementComponent extends SearchTableComponent implements OnInit {
  _PAGE_ID_ = 'AnnouncementManagementComponent';
  modalForm: FormGroup;
  modalFormRef: NzModalRef;
  allLine = [];
  orgCode = ToolsUtil.getOrgCode();
  userId = LocalStorageUtil.getUserId();
  isModalLoading = false;
  isOwnedLessonPackageLoading = false;
  isManager: any = '0';
  nodes = [
    {
      title: 'Node1',
      value: '0-0',
      key: '0-0',
      children: [
        {
          title: 'Child Node1',
          value: '0-0-0',
          key: '0-0-0',
          isLeaf: true
        }
      ]
    },
    {
      title: 'Node2',
      value: '0-1',
      key: '0-1',
      children: [
        {
          title: 'Child Node3',
          value: '0-1-0',
          key: '0-1-0',
          isLeaf: true
        },
        {
          title: 'Child Node4',
          value: '0-1-1',
          key: '0-1-1',
          isLeaf: true
        },
        {
          title: 'Child Node5',
          value: '0-1-2',
          key: '0-1-2',
          isLeaf: true
        }
      ]
    }
  ]
  @ViewChild('modalContent') modalContent: TemplateRef<any>;

  constructor(
    private fb: FormBuilder,
    private modalService: NzModalService,
    private knowledgeManageService: KnowledgeManageService,
    public message: NzMessageService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    super();
    this.initializeForm();
  }

  initializeForm(): void {
    this.modalForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required, spaceValidator(), Validators.maxLength(25)]],
      announcementContent: ['', [Validators.required, spaceValidator(), Validators.maxLength(200)]],
      ownedLessonPackage: [[], [Validators.required]], // ?????????
    });
  }

  onChange(result: Date): void {
    console.log('onChange: ', result);
  }

  initializeFormFieldState(): void {
    // tslint:disable-next-line:forin
    for (const i in this.modalForm.controls) {
      this.modalForm.controls[i].markAsUntouched();
      this.modalForm.controls[i].markAsPristine();
      this.modalForm.controls[i].updateValueAndValidity();
    }
  }


  /*
  * @Override
  * @*/
  getDataList() {
    const param: ProfessionalParams = {
      page: this.pageIndex,
      limit: this.pageSize,
      orgCode: ToolsUtil.getOrgCode(),
      searchKey: this.searchWord,
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





  makeFormDirty(): void {
    // tslint:disable-next-line:forin
    for (const i in this.modalForm.controls) {
      this.modalForm.controls[i].markAsDirty();
      this.modalForm.controls[i].updateValueAndValidity();
    }
  }


  add(): void {
    this.modalForm.patchValue({
      id: '',
      name: '', // ????????????
      announcementContent: '',
      ownedLessonPackage: [] // ?????????
    });
    this.initializeFormFieldState();
    this.showModal('????????????');
  }

  edit(data: any): void {
    this.modalForm.patchValue({
      id: data.id,
      name: data.name,
      announcementContent: data.announcementContent,
      ownedLessonPackage: data.ownedLessonPackage, //  ?????????
    });
    this.initializeFormFieldState();
    this.showModal('????????????');
  }


  send(data) {
    this.modalService.confirm({
      nzTitle: '??????',
      nzContent: `?????????????????????${data.name}???????????????`,
      nzOkText: '??????',
      nzCancelText: '??????',
      nzOnOk: () => {
      }
    });
  }

  showModal(title: string) {
    this.modalFormRef = this.modalService.create({
      nzTitle: title,
      nzContent: this.modalContent,
      nzMaskClosable: false,
      nzWrapClassName: 'vertical-center-modal',
      nzCancelText: '??????',
      nzOkText: '??????',
      nzOnOk: (e) => {
        return this.confirm();
      }
    });
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
        postData.majorTypeName = '????????????';
      } else {
        postData.majorTypeName = '????????????';
      }
      this.knowledgeManageService.saveMajor(postData).subscribe(success, error);
    });
  }

  del(data: any) {
    this.modalService.confirm({
      nzTitle: '????????????',
      nzContent: `??????????????????${data.name}???????????????`,
      nzOkText: '??????',
      nzCancelText: '??????',
      nzOnOk: () => {
        this.knowledgeManageService.delMajor({id: data.id}).subscribe((res) => {
          this.searchData();
        });
      }
    });
  }

  onPacketChange($event: any) {

  }
}
