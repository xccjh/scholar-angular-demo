import {Component, OnInit, Input} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NzModalRef} from 'ng-zorro-antd/modal';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {repeatName, spaceValidator} from 'src/app/shared/validators/atr-validtors';

@Component({
  selector: 'app-structure-adjustment-section',
  templateUrl: './structure-adjustment-section.component.html',
  styleUrls: ['./structure-adjustment-section.component.less']
})
export class StructureAdjustmentSectionComponent implements OnInit {
  formGroup: FormGroup;
  loading = false;
  @Input() data: any;
  @Input() formData: any;
  @Input() courseId: string;
  @Input() coursePacketId: string;
  private lock = false;

  constructor(
    private fb: FormBuilder,
    private courseMgService: CourseManageService,
    private nzModalRef: NzModalRef) {
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      name: [this.formData ? this.formData.name : '',
        [Validators.required, Validators.maxLength(60), repeatName(this.data.children), spaceValidator()]]
    });
  }

  getSeq(arr) {
    let maxSeq = 0;
    arr.forEach((item) => {
      if (item.seq > maxSeq) {
        maxSeq = item.seq;
      }
    });
    maxSeq += 1;
    return maxSeq;
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
      const sectionId = this.formData ? this.formData.id : '';
      const sectionSeq = (this.formData && this.formData.seq) ?
        this.formData.seq : (this.data.children.length ? this.getSeq(this.data.children) : 1);
      const postData = {
        courseId: this.courseId,
        coursePacketId: this.coursePacketId,
        chapters: [
          {
            id: this.data.id,
            name: this.data.name,
            seq: this.data.seq,
            sections: [
              {
                id: sectionId,
                name: this.formGroup.value.name,
                seq: sectionSeq,
              }
            ]
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
        this.nzModalRef.close(res.data);
      }, () => this.lock = false);
    }
  }

  cancel() {
    this.nzModalRef.close(null);
  }

}
