import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzTreeNodeOptions} from 'ng-zorro-antd';
import {TrainManageService} from 'src/app/busi-services/train-manage.service';
import {ActivatedRoute} from '@angular/router';
import {MenuService} from 'core/services/menu.service';
import {NzResizeEvent} from 'ng-zorro-antd/resizable';
import {LEARNING_TARGET} from 'core/base/static-data';
import {FormBuilder, Validators, FormGroup} from '@angular/forms';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {spaceValidator} from 'src/app/shared/validators/atr-validtors';

@Component({
  selector: 'app-save-train-course',
  templateUrl: './save-train-course.component.html',
  styleUrls: ['./save-train-course.component.less'],
})
export class SaveTrainCourseComponent implements OnInit {
  width;
  id = -1;
  type = 'add';
  resourceId = '';
  curProfessor: any = {};
  curProfessorId = '';
  defaultTreeKey: any = [];
  checkTreeNode: any = [];
  data: any = {};
  isLoading = false;
  userInfo = LocalStorageUtil.getUser();
  learningTarget = LEARNING_TARGET;
  modalForms: FormGroup;
  @ViewChild('treeContainer') treeContainer: ElementRef<any>;

  constructor(
    private message: NzMessageService,
    private trainManageService: TrainManageService,
    private routerinfo: ActivatedRoute,
    private menuService: MenuService,
    private fb: FormBuilder
  ) {
  }

  get titleContent() {
    return this.modalForms.get('title').value.length;
  }

  ngOnInit() {
    this.initParam();
    this.initForm();
    if (this.type !== 'add') {
      this.getData(this.resourceId);
    }
    this.echoTreeData();
  }

  echoTreeData() {
    const {select} = this.routerinfo.snapshot.queryParams;
    if (select) {
      this.defaultTreeKey = [select];
      this.checkTreeNode = [select];
    }
  }

  initParam() {
    this.routerinfo.params.subscribe((param) => {
      const {id, type, professionId} = param;
      this.type = type;
      this.resourceId = id;
      this.curProfessorId = professionId;
      this.curProfessor = {id: professionId};
    });
  }

  initForm() {
    this.modalForms = this.fb.group({
      authorName: [this.userInfo.nickName, [Validators.required]],
      authorUnit: ['1', [Validators.required]],
      title: ['', [Validators.required, Validators.maxLength(30), spaceValidator()]],
      learningGoalCode: ['', [Validators.required]],
      accountId: ['', [Validators.required]],
    });
  }

  onResize({width}: NzResizeEvent): void {
    const flag = this.treeContainer
      && this.treeContainer.nativeElement
      && this.treeContainer.nativeElement.offsetWidth;
    if (
      flag && ((this.treeContainer.nativeElement.offsetWidth + 80 < width))
      ||
      (flag && (this.treeContainer.nativeElement.offsetWidth + 10) > width)
    ) {
      return;
    }
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      // tslint:disable-next-line:no-non-null-assertion
      this.width = width!;
    });
  }


  nodeChange(nodeOpt: NzTreeNodeOptions) {
    this.checkTreeNode = [nodeOpt.id];
  }

  getData(id): void {
    const success = (result: any) => {
      this.data = result.data || {};
      this.defaultTreeKey = [this.data.industryId];
      this.checkTreeNode = [this.data.industryId];
      this.modalForms.patchValue({
        authorName: this.data.authorName, // 作者
        authorUnit: this.data.authorUnit, // 单位
        title: this.data.title, // title
        learningGoalCode: this.data.learningGoalCode,
        accountId: this.data.accountId, // 系统
      });
      this.isLoading = false;
    };

    const error = (err: any) => {
      this.isLoading = false;
      this.message.create('error', JSON.stringify(err));
    };

    this.isLoading = true;
    this.trainManageService.getPracticalById({id}).subscribe(success, error);
  }


  goBack() {
    this.menuService.goBack(false);
    this.menuService.gotoUrl({
      url: '/m/rm/setting',
      paramUrl: '',
      title: '实训设置'
    });
  }


  onContine(flag?) {
    // tslint:disable-next-line:forin
    for (const key in this.modalForms.controls) {
      this.modalForms.controls[key].markAsDirty();
      this.modalForms.controls[key].updateValueAndValidity();
    }
    if (this.modalForms.valid) {
      if (this.curProfessor.id === this.checkTreeNode[0]) {
        this.message.warning('请选择行业新增实训，目前您选择了课程');
        return;
      }
      if (!this.checkTreeNode[0]) {
        return this.message.warning('请选择行业再进行实训设置');
      }
      const params: any = {
        ...this.modalForms.value,
        industryId: this.checkTreeNode[0],
        companyId: '0'
      };

      if (this.resourceId && this.type === 'edit') {
        params.id = this.resourceId;
      }
      const success = (result: any) => {
        this.isLoading = false;
        if (result.status === 201) {
          if (flag) {
            this.goBack();
          } else {
            this.modalForms.patchValue({
              title: '', // title
              learningGoalCode: '',
              accountId: '', // 系统
            });
            // tslint:disable-next-line:forin
            for (const key in this.modalForms.controls) {
              this.modalForms.controls[key].markAsPristine();
              this.modalForms.controls[key].markAsUntouched();
              this.modalForms.controls[key].updateValueAndValidity();
            }
          }
        }
      };
      const error = () => {
        this.isLoading = false;
      };
      this.isLoading = true;
      this.trainManageService.savePractical(params).subscribe(success, error);
    }
  }
}
