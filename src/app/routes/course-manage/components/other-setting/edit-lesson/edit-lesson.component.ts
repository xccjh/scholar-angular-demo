import {Component, EventEmitter, Input, OnDestroy, OnInit} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {spaceValidator} from '@app/shared/validators/atr-validtors';
import {LessonsItemOption} from '../other-setting.interface';
import {StatisticsLogService} from '@app/busi-services/statistics-log.service';
import {STATISTICALRULES} from 'core/base/static-data';


@Component({
  selector: 'app-edit-lesson',
  templateUrl: './edit-lesson.component.html',
  styleUrls: ['./edit-lesson.component.less'],
})
export class EditLessonComponent implements OnInit {
  @Input() data: LessonsItemOption = {};
  courseForm: FormGroup;
  editLessonLoading = false;


  constructor(
    private nzMesService: NzMessageService,
    private nzModalService: NzModalService,
    private nzModalRef: NzModalRef,
    private fb: FormBuilder,
    private courseManageService: CourseManageService,
    private statisticsLogService: StatisticsLogService,
  ) {
    this.courseForm = this.fb.group({
      name: ['', [Validators.required, spaceValidator(), Validators.maxLength(25)]]
    });
  }

  ngOnInit() {
    this.courseForm.patchValue({
      name: this.data.name
    });

  }


  save() {
    for (const i in this.courseForm.controls) {
      if (this.courseForm.controls.hasOwnProperty(i)) {
        this.courseForm.controls[i].markAsDirty();
        this.courseForm.controls[i].updateValueAndValidity();
      }
    }
    if (this.courseForm.invalid) {
      return;
    }
    this.editLessonLoading = true;
    const {
      id, courseId, coursePacketId, seq
    }
      = this.data;
    const params = {
      id,
      name: this.courseForm.value.name,
      courseId,
      coursePacketId,
      seq
    };
    this.courseManageService.saveTable(params).subscribe(data => {
      this.editLessonLoading = false;
      if (data.status === 201) {
        this.statisticsLogService.statisticsPacketInfoLog({
          name: '编辑课次',
          actionCode: STATISTICALRULES.packetInfo['otherSet-lessons-action'].modify,
          content: JSON.stringify(params),
        });
        this.nzModalRef.close(true);
      }
    }, () => {
      this.editLessonLoading = false;
    });
  }

  cancel() {
    this.nzModalRef.close(false);
  }

}

