import {Component, OnInit, Input} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NzModalRef} from 'ng-zorro-antd/modal';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {repeatName, spaceValidator} from 'src/app/shared/validators/atr-validtors';

@Component({
  selector: '',
  templateUrl: './structure-adjustment-chapter.component.html',
  styleUrls: ['./structure-adjustment-chapter.component.less']
})
export class StructureAdjustmentChapterComponent implements OnInit {
  formGroup: FormGroup;
  loading = false;
  @Input() data: any;
  @Input() formData: any;
  @Input() courseId: string;
  @Input() coursePacketId: string;
  lock = false;

  constructor(
    private fb: FormBuilder,
    private courseMgService: CourseManageService,
    private nzModalRef: NzModalRef) {
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      name: [this.formData ? this.formData.name : '',
        [Validators.required, Validators.maxLength(60), repeatName(this.data), spaceValidator()]]
    });
  }

  save() {
    if (!this.lock) {
      Object.keys(this.formGroup.controls).forEach(key => {
        this.formGroup.controls[key].markAsDirty();
        this.formGroup.controls[key].updateValueAndValidity();
      });
      if (this.formGroup.invalid) {
        return;
      }
      this.lock = true;
      const chapterId = this.formData ? this.formData.id : '';
      const chapterSeq = this.formData ? this.formData.seq : (this.data.length > 0 ? this.data.length + 1 : 1);
      const postData = {
        courseId: this.courseId,
        coursePacketId: this.coursePacketId,
        chapters: [
          {
            id: chapterId,
            name: this.formGroup.value.name,
            seq: chapterSeq
          }
        ]
      };
      this.loading = true;
      this.courseMgService.save_courseChapter(postData).subscribe(res => {
        this.lock = false;
        this.loading = false;
        if (res.status !== 200) {
          return;
        }
        const chapter = res.data[0];
        chapter.children = [];
        this.nzModalRef.close(res.data[0]);
      }, () => this.lock = false);
    }
  }

  cancel() {
    this.nzModalRef.close(null);
  }

}
