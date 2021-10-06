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
import {HqItem} from '../other-setting.interface';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {STATISTICALRULES} from 'core/base/static-data';
import {StatisticsLogService} from '@app/busi-services/statistics-log.service';

@Component({
  selector: 'app-new-hq',
  templateUrl: './new-hq.component.html',
  styleUrls: ['./new-hq.component.less'],
})
export class NewHqComponent implements OnInit {
  @Input() courseId: string;
  @Input() coursePacketId: string;
  @Input() hqLists: any[];
  @Input() hqItem: Partial<HqItem>;
  newHqForm: FormGroup;
  newHqLoading = false;
  isUsed = SessionStorageUtil.getPacketInfoItem('isUsed');

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
    const {hqItem} = this;
    if (hqItem.id) {
      this.newHqForm = new FormGroup({
        name: new FormControl(
          {
            value: hqItem.name,
            disabled: false
          }, [Validators.required, Validators.maxLength(40)]),
        accountHqId: new FormControl(
          {
            value: hqItem.accountHqId,
            disabled:  this.isUsed > 0
          }, [Validators.required, Validators.maxLength(40)]),
      });
    } else {
      this.newHqForm = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(40)]],
        accountHqId: ['', [Validators.required,Validators.maxLength(40)]],
      });
    }
  }


  save() {
    for (const i in this.newHqForm.controls) {
      if (this.newHqForm.controls.hasOwnProperty(i)) {
        this.newHqForm.controls[i].markAsDirty();
        this.newHqForm.controls[i].updateValueAndValidity();
      }
    }
    if (this.newHqForm.invalid) {
      return;
    }
    this.newHqLoading = true;
    const seq = this.hqItem?.seq;
    const content = {
      id: this.hqItem?.id,
      courseId: this.courseId,
      coursePacketId: this.coursePacketId,
      name: this.newHqForm.value.name,
      accountHqId: this.newHqForm.value.accountHqId,
      seq: seq ? seq : ToolsUtil.getMaxSeq(this.hqLists),
      status: 1,
    }
    this.courseManageService.addCoursePacketHq(content).subscribe(res => {
      this.newHqLoading = false;
      // const edit = !!this.hqItem.id;
      // const field = edit ? 'modify' : 'addCode';
      // this.statisticsLogService.statisticsPacketInfoLog({
      //   name: edit ? '修改恒企实习系统实训信息' : '新增恒企实习系统实训',
      //   actionCode: STATISTICALRULES.packetInfo['otherSet-99train-action'][field],
      //   content: JSON.stringify(content),
      // });
      if (res.status === 201) {
        this.nzModalRef.close(true);
      }
    }, () => {
      this.newHqLoading = false;
    });
  }

  cancel() {
    this.nzModalRef.close(false);
  }

  getNameLength() {
    const {name} = this.newHqForm.controls;
    return typeof name === 'string' ? (name as string).length : name.value.length;
  }
  getIdLength() {
    const {accountHqId}= this.newHqForm.controls;
    return typeof accountHqId === 'string' ? (accountHqId as string).length : accountHqId.value.length;
  }
}

