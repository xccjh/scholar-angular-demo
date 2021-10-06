import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {MenuService} from 'core/services/menu.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {MaterialLibraryService} from '@app/busi-services/material-library.service';
import {getName, LEARNING_TARGET} from 'core/base/static-data';
import {NzResizeEvent} from 'ng-zorro-antd/resizable';
import {spaceValidator} from 'src/app/shared/validators/atr-validtors';
import {NzModalService, NzTreeNode} from 'ng-zorro-antd';
import {ToolsUtil} from 'core/utils/tools.util';

//  文献 动画 讲义
@Component({
  selector: 'app-material-other',
  templateUrl: './material-other.component.html',
  styleUrls: ['./material-other.component.less']
})
export class MaterialOtherComponent implements OnInit {
  wid = -1;
  width;
  professionId = '';
  knowledgePointIds: string[] = [];
  title = '';
  id = '';
  coursewareType = '';
  isEdit = false;
  validateForm: FormGroup;
  learnTargetArr = LEARNING_TARGET;
  isSaveLoading = false;
  defaultTreeKey = [];
  minType = 5;
  createrName = '';
  code = '';
  @ViewChild('treeContainer') treeContainer: ElementRef<any>;
  @Input() type: string;
  @ViewChild('treeknowledge') treeknowledge;
  private orgCode = ToolsUtil.getOrgCode();


  constructor(
    private message: NzMessageService,
    private materialLibService: MaterialLibraryService,
    private menuService: MenuService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private modalService: NzModalService,
  ) {
  }


  ngOnInit(): void {
    this.initParam();
    this.initializeData();
  }

  initializeData() {
    if (this.id === '0') {
      this.isEdit = false;
      this.title = `新增${getName(this.coursewareType, 'MATERIAL_TYPE')}`;
      this.initializeForm({});
    } else {
      this.isEdit = true;
      this.title = `编辑${getName(this.coursewareType, 'MATERIAL_TYPE')}`;
      this.initializeForm({});
      this.materialLibService.getResourceDetail(this.id, this.coursewareType).subscribe(result => {
        if (result.status === 200) {
          this.createrName = result.data.createrName;
          this.initializeForm(result.data);
        }
      });
    }
  }

  initParam() {
    this.code = this.route.snapshot.queryParams.code;
    const routerP = this.route.snapshot.paramMap;
    this.id = routerP.get('id');
    this.coursewareType = routerP.get('type');
    this.professionId = routerP.get('professionId');
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
    cancelAnimationFrame(this.wid);
    this.wid = requestAnimationFrame(() => {
      // tslint:disable-next-line:no-non-null-assertion
      this.width = width!;
    });
  }

  initializeForm(data: any) {
    const {id, learningGoalCode, attachmentName, resourceUrl, title, authorName, watermarkText, isWatermark} = data;
    this.validateForm = this.fb.group({
      id: [this.isEdit ? id : ''],
      points: [[]], // [{pointId:"知识点id"},{pointId:"知识点id"}]
      title: this.isEdit ? [data.title, [Validators.required, spaceValidator(), Validators.maxLength(30)]] : ['', []], // 资源名称
      type: [this.coursewareType], // 资源种类
      coursewareType: [this.coursewareType], // 素材类型
      learningGoalCode: [this.isEdit ? learningGoalCode : '', [Validators.required]], // 学习目标
      uploadFileArr: [this.isEdit ? [{name: attachmentName, path: resourceUrl, title}] : []],
      authorName: [this.isEdit ? authorName :
        (this.orgCode === 'zksd' ? '考拉日记' : '恒企教育'), [Validators.required, spaceValidator(), Validators.maxLength(30)]],
      watermarkText: [this.isEdit ? watermarkText :
        (this.orgCode === 'zksd' ? '考拉日记' : '恒企教育'), [Validators.required, spaceValidator(), Validators.maxLength(30)]],
      isWatermark: [this.isEdit ? isWatermark : '1', [Validators.required]]
    });
    if (this.isEdit && data.resourcePoints && data.resourcePoints[0] && data.resourcePoints[0].knowledgePointId) {
      this.knowledgePointIds = this.defaultTreeKey = data.resourcePoints.map(({knowledgePointId}) => knowledgePointId);
    }
  }

  submitForm(): void {
    if (this.validateForm.value.isWatermark !== '1') {
      this.validateForm.get('watermarkText').clearValidators();
    } else {
      this.validateForm.get('watermarkText').setValidators([Validators.required, spaceValidator(), Validators.maxLength(30)]);
    }
    // tslint:disable-next-line:forin
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if (this.validateForm.invalid) {
      this.message.warning('请按规则填写完整');
      return;
    }
    const postData = JSON.parse(JSON.stringify(this.validateForm.value));
    postData.type = this.coursewareType;
    postData.coursewareType = this.coursewareType;
    // 回显和点击树有数据
    if (this.knowledgePointIds.length) {
      postData.pointType = 1;
      postData.points = this.knowledgePointIds.map((ele: string) => ele);
    } else {
      postData.pointType = 2;
      postData.points = [this.treeknowledge.nodes[0].id];
    }
    if (postData.uploadFileArr.length === 0) {
      this.message.warning('请上传资源');
      return;
    }
    let isUploadFail = false;
    if (this.isEdit) {
      postData.attachmentInfos = postData.uploadFileArr.map((ele: any) => {
        if (!ele.path) {
          isUploadFail = true;
        }
        return {
          attachmentName: ele.name,
          attachmentPath: ele.path,
          title: postData.title
        };
      });
    } else {
      postData.attachmentInfos = [];
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < postData.uploadFileArr.length; i++) {
        const ele = postData.uploadFileArr[i];
        if (!ele.path) {
          isUploadFail = true;
        }
        postData.attachmentInfos.push({
          attachmentName: ele.name,
          attachmentPath: ele.path,
          title: ele.title
        });
        if (!ele.title) {
          this.message.warning('资源标题不能为空');
          return;
        }
      }
    }
    if (isUploadFail) {
      this.message.warning('请等待资源上传完成');
      return;
    }
    delete postData.uploadFileArr;


    if (this.minType === 5 && this.knowledgePointIds.length === 0) {
      this.modalService.warning({
        nzTitle: `未选择知识点资料将挂到课程，确定吗？`,
        nzCancelText: '取消',
        nzOkText: '确定',
        nzOnOk: () => {
          return this.savaRecourse(postData);
        },
      });
    } else {
      if (postData.pointType === 2) {
        this.modalService.warning({
          nzTitle: `选择的节点未包含知识点，资料将挂到课程，确定吗？`,
          nzCancelText: '取消',
          nzOkText: '确定',
          nzOnOk: () => {
            return this.savaRecourse(postData);
          },
        });
      } else {
        this.savaRecourse(postData);
      }
    }
  }

  savaRecourse(postData) {
    return new Promise((resolve) => {
      this.isSaveLoading = true;
      this.materialLibService.saveCourseware(postData).subscribe(result => {
        this.isSaveLoading = false;
        if (result.status === 201) {
          resolve(true);
          this.goBack();
        } else {
          if (result.status === 500) {
            this.message.error('服务端业务异常');
          }
          resolve(false);
        }
      }, () => {
        resolve(false);
        this.isSaveLoading = false;
      });
    });

  }

  nodeChange(nodeOpt: any) {
    this.knowledgePointIds = this.getCheckedLeafKey(nodeOpt);
    const obj = {minType: 5};
    this.getMinLavel(nodeOpt, obj);
    this.minType = obj.minType;
  }

  getMinLavel(nodeOpt, obj) {
    if (nodeOpt.length) {
      nodeOpt.forEach((e) => {
        if (e.origin && e.origin.children && e.origin.children.length) {
          this.getMinLavel(e.children, obj);
        }
        if (obj.minType > e.origin.kType) {
          obj.minType = e.origin.kType;
        }
      });
    }
  }

  getCheckedLeafKey(arr: any[]): string[] {
    const keys: string[] = [];
    const recurTree = (checkKeyArr: any[]) => {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < checkKeyArr.length; i++) {
        const node =
          checkKeyArr[i] instanceof NzTreeNode
            ? checkKeyArr[i].origin
            : checkKeyArr[i];
        if (node.children && node.children.length > 0) {
          recurTree(node.children);
        } else {
          if (node.isLeaf && node.checked && (node.kType === '4')) {
            keys.push(node.id);
          }
        }
      }
    };
    recurTree(arr);
    return keys;
  }

  goBack() {
    this.menuService.goBack(false);
    this.menuService.gotoUrl({
      url: '/m/rm/read',
      paramUrl: '',
      title: '阅读库'
    });
  }
}
