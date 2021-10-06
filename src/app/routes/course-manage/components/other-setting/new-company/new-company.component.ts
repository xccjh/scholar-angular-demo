import {Component, Input, OnInit} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ToolsUtil} from 'core/utils/tools.util';
import {NzUploadXHRArgs} from 'ng-zorro-antd';
import {Observable, Observer} from 'rxjs';
import {UploadDir} from 'core/utils/uploadDir';
import {UploadOssService} from 'core/services/upload-oss.service';
import {NzUploadFile} from 'ng-zorro-antd/upload/interface';
import {CompanyItem} from '../other-setting.interface';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {STATISTICALRULES} from 'core/base/static-data';
import {StatisticsLogService} from '@app/busi-services/statistics-log.service';

@Component({
  selector: 'app-new-company',
  templateUrl: './new-company.component.html',
  styleUrls: ['./new-company.component.less'],
})
export class NewCompanyComponent implements OnInit {
  @Input() courseId: string;
  @Input() coursePacketId: string;
  @Input() companyLists: any[];
  @Input() companyItem: Partial<CompanyItem>;
  newCompanyForm: FormGroup;
  newCompanyLoading = false;
  nzFileList: NzUploadFile[] = [];
  isUsed = SessionStorageUtil.getPacketInfoItem('isUsed');
  private acceptType = ['zip', 'rar'];

  constructor(
    private nzMesService: NzMessageService,
    private nzModalService: NzModalService,
    private nzModalRef: NzModalRef,
    private fb: FormBuilder,
    private uploadOssService: UploadOssService,
    private courseManageService: CourseManageService,
    private statisticsLogService: StatisticsLogService,
  ) {
  }

  ngOnInit() {
    const {companyItem} = this;
    if (companyItem.id) {
      const {name, termType, filePath, fileName, permission} = companyItem;
      const item = {
        name,
        termType,
        filePath,
        permission: permission ? permission.split(',') : []
      };
      this.nzFileList = [{
        ...item, ...{
          uid: ToolsUtil.getRandomFileName(),
          name: fileName
        }
      }];
      this.newCompanyForm = new FormGroup({
        name: new FormControl(
          {
            value: item.name,
            disabled: this.isUsed > 0
          }, [Validators.required, Validators.maxLength(40)]),
        termType: new FormControl(
          {
            value: item.termType,
            disabled: this.isUsed > 0
          }, Validators.required),
        filePath: new FormControl(
          item.filePath, Validators.required),
        permission: new FormControl(
          item.permission, Validators.required),
      });
    } else {
      this.newCompanyForm = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(40)]],
        termType: [0, [Validators.required]],
        filePath: ['', [Validators.required]],
        permission: [['业务中心', '数字大脑'], [Validators.required]]
      });
    }
  }

  beforeUpload = (item: NzUploadXHRArgs) => {
    return new Observable((observer: Observer<boolean>) => {
      let pass = true;
      if (item.name.length > 35) {
        this.nzMesService.error('文件名字太长啦，保证包含扩展名35个文字以内');
        pass = false;
      }
      if (this.acceptType.indexOf(ToolsUtil.getExt(item.name)) < 0) {
        this.nzMesService.error('请上传zip或rar压缩类型的文件');
        pass = false;
      }
      if (pass) {
        observer.next(true);
        observer.complete();
      } else {
        observer.next(false);
      }
    });
  };

  removeFileSelf = (item: NzUploadXHRArgs) => {
    this.nzFileList = [];
    this.newCompanyForm.patchValue({
      filePath: ''
    });
    this.newCompanyForm.controls.filePath.markAsUntouched();
    this.newCompanyForm.controls.filePath.markAsPristine();
    this.newCompanyForm.controls.filePath.updateValueAndValidity();
  };

  customRewardRequest = (item: NzUploadXHRArgs) => {
    this.newCompanyLoading = true;
    this.uploadOssService
      .uploadOss(item.file, UploadDir.company_file)
      .subscribe((result) => {
        this.newCompanyLoading = false;
        this.newCompanyForm.patchValue({
          filePath: result
        });
        item.onSuccess({...item}, item.file, {});
      }, (err) => {
        this.newCompanyLoading = false;
        item.onError(err, item.file);
        this.nzMesService.error(JSON.stringify(err));
      });
  };


  save() {
    for (const i in this.newCompanyForm.controls) {
      if (this.newCompanyForm.controls.hasOwnProperty(i)) {
        this.newCompanyForm.controls[i].markAsDirty();
        this.newCompanyForm.controls[i].updateValueAndValidity();
      }
    }
    if (this.newCompanyForm.invalid) {
      return;
    }
    this.newCompanyLoading = true;
    const seq = this.companyItem?.seq;
    const content = {
      id: this.companyItem?.id,
      courseId: this.courseId,
      coursePacketId: this.coursePacketId,
      name: this.newCompanyForm.value.name,
      seq: seq ? seq : ToolsUtil.getMaxSeq(this.companyLists),
      filePath: this.newCompanyForm.value.filePath,
      status: 1,
      fileName: this.nzFileList[0].name,
      termType: this.newCompanyForm.value.termType,
      permission: this.newCompanyForm.value.permission.join(','),
    }
    this.courseManageService.addCoursePacketCompany(content).subscribe(res => {
      this.newCompanyLoading = false;
      const edit = !!this.companyItem.id;
      const field = edit ? 'modify' : 'addCode';
      this.statisticsLogService.statisticsPacketInfoLog({
        name: edit ? '修改公司信息' : '新增公司',
        actionCode: STATISTICALRULES.packetInfo['otherSet-99train-action'][field],
        content: JSON.stringify(content),
      });
      if (res.status === 201) {
        this.nzModalRef.close(true);
      }
    }, () => {
      this.newCompanyLoading = false;
    });
  }

  cancel() {
    this.nzModalRef.close(false);
  }

  getNameLength() {
    const {name} = this.newCompanyForm.controls;
    return typeof name === 'string' ? (name as string).length : name.value.length;
  }
}

