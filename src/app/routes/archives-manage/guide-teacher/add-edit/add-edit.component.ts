import { Component, OnInit, ViewChild, TemplateRef, Output, EventEmitter } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { spaceValidator } from 'src/app/shared/validators/atr-validtors';

@Component({
  selector: 'app-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.less']
})
export class AddEditComponent implements OnInit {
  modalForm: FormGroup;
  changeListType = 'edit';
  // child
  @ViewChild('addEditModalContent') addEditModalContent: TemplateRef<any>;
  @Output() changeTableList = new EventEmitter();
  constructor(
    private modalService: NzModalService,
    private fb: FormBuilder,
  ) {
  }
  ngOnInit(): void {
    // 初始化新增编辑表单并制定校验规则
    this.modalForm = this.fb.group({
      formTeacherName: ['', [Validators.required, Validators.maxLength(30), spaceValidator()]],
      formTeacherSynopsis: ['', [Validators.required, Validators.maxLength(200),  spaceValidator()]],
      formVideoId: ['', [Validators.maxLength(50),  spaceValidator()]],
      formVideoName: ['', [Validators.maxLength(100),  spaceValidator()]]
    });
  }
  changeFormState(valid: boolean = true): void {
    const controls = this.modalForm.controls;
    for (const i in controls) {
      const item = controls[i];
      if (valid) {
        // 校验
        item.markAsDirty();
      } else {
        // 清空校验
        item.markAsUntouched();
        item.markAsPristine();
      }
      item.updateValueAndValidity();
    }
  }
  setFormValue(row: any = {}): void {
    // 回显
    console.log(row, 'row');
    this.modalForm.patchValue({
      formTeacherName: row.name || '',
      formVideoId: row.videoId || '',
      formTeacherSynopsis: row.introduction || '',
      formVideoName: row.videoName || ''
    });
    if (!row.id) {
      this.changeFormState(false);
      this.changeListType = 'changeList';
    }
  }
  createFormModal(obj: any = {}) {
    const self = this;
    self.setFormValue(obj.row);
    self.modalService.create({
      nzTitle: obj.title,
      nzContent: self.addEditModalContent,
      nzMaskClosable: false,
      nzWrapClassName: 'vertical-center-modal',
      nzBodyStyle: {paddingBottom: '0px'},
      nzCancelText: '取消',
      nzOkText: '保存',
      nzOnOk: (e) => {
        self.changeFormState();
        if (!self.modalForm.valid) { return false; }
        const {
          formTeacherName,
          formVideoId,
          formTeacherSynopsis,
          formVideoName
        } = self.modalForm.value;
        console.log(obj.row);

        const params = {
          name: formTeacherName,
          introduction: formTeacherSynopsis ,
          videoId: formVideoId,
          VideoName: formVideoName,
          id: obj.row ? obj.row.id : ''
        };
        obj.httpServer.guideTeacherAddEdit(params).subscribe((res) => {
          self.changeTableList.emit(self.changeListType);
        });
      }
    });
  }
}
