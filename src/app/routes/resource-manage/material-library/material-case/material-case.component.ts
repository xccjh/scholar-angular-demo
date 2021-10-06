import {AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {MenuService} from 'core/services/menu.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {MaterialLibraryService} from '@app/busi-services/material-library.service';
import {EDITOR_CONFIG, getName, LEARNING_TARGET} from 'core/base/static-data';
import {ToolsUtil} from 'core/utils/tools.util';
import {NzResizeEvent} from 'ng-zorro-antd/resizable';
import {spaceValidator} from 'src/app/shared/validators/atr-validtors';
import {NzModalService, NzTreeNode} from 'ng-zorro-antd';
import {environment} from 'src/environments/environment';
import {UploadDir} from 'core/utils/uploadDir';
import ClassicEditor from '@xccjh/xccjh-ckeditor5-video-file-upload';
import {UploadOssService} from 'core/services/upload-oss.service';
import {WINDOW} from '@app/service/service.module';
import {timer} from 'rxjs';
import {DOCUMENT} from '@angular/common';


// 案例
@Component({
  selector: 'app-material-case',
  templateUrl: './material-case.component.html',
  styleUrls: ['./material-case.component.less'],
})
export class MaterialCaseComponent implements OnInit, AfterViewInit, OnDestroy {
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
  ktype = 1;
  minType = 5;
  defaultTreeKey = [];
  dailDown0 = false;
  dailDown1 = false;
  dailDown2 = false;
  dailDownMove: any = {
    0: {
      isDown: false,
      leftCha: 0,
      topCha: 0,
      init: false,
    },
    1: {
      isDown: false,
      leftCha: 0,
      topCha: 0,
      init: false,
    },
    2: {
      isDown: false,
      leftCha: 0,
      topCha: 0,
      init: false,
    },
  };
  Editor = ClassicEditor;
  isBackgroundLoading = false;
  isGuideLoading = false;
  isAnalysisLoading = false;
  backgroundConfig = Object.assign({}, EDITOR_CONFIG, this.getImgVideoReosolver('isBackgroundLoading'));
  analysisConfig = Object.assign({}, EDITOR_CONFIG, this.getImgVideoReosolver('isAnalysisLoading'));
  guideConfig = Object.assign({}, EDITOR_CONFIG, this.getImgVideoReosolver('isGuideLoading'));
  current = 0;
  dom: any = {};
  domEdit: any = {};
  domContainer: any = {};
  domIcon: any = {};
  domIconOut: any = {};
  domMoveHandler: any = {};
  percent = 100;
  saveLoading = false;
  orgCode = ToolsUtil.getOrgCode();
  @ViewChild('treeContainer') treeContainer: ElementRef<any>;
  @ViewChild('treeknowledge') treeknowledge;
  @ViewChild('background', {static: true}) background: any;
  @ViewChild('analysis', {static: true}) analysis: any;
  @ViewChild('guide', {static: true}) guide: any;


  constructor(
    private message: NzMessageService,
    private materialLibService: MaterialLibraryService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private menuService: MenuService,
    private modalService: NzModalService,
    private uploadOssService: UploadOssService,
    private renderer2: Renderer2,
    @Inject(WINDOW) public win: any,
    @Inject(DOCUMENT) private doc: Document
  ) {
    this.win.that = this;
  }

  ngOnInit(): void {
    this.initParam();
    this.initializeData();
  }

  ngAfterViewInit() {
    timer(1000).subscribe(() => {
      this.win.addEventListener('mousemove', this.nailMove);
    });
  }

  ngOnDestroy() {
    this.win.removeEventListener('mousemove', this.nailMove);
    Object.keys(this.domMoveHandler).forEach(ee => {
      this.domMoveHandler[ee].removeEventListener('mousemove', this.startMove);
      this.domMoveHandler[ee].removeEventListener('mouseup', this.endMove);
    });
  }

  initParam() {
    const routerP = this.route.snapshot.paramMap;
    this.id = routerP.get('id');
    this.coursewareType = routerP.get('type');
    this.professionId = routerP.get('professionId');
  }

  percentReport(percent) {
    this.percent = percent;
  }

  initializeData() {
    this.initializeForm({});
    if (this.id === '0') {
      this.isEdit = false;
      this.title = `新增${getName(this.coursewareType, 'MATERIAL_TYPE')}`;
    } else {
      this.isEdit = true;
      this.title = `编辑${getName(this.coursewareType, 'MATERIAL_TYPE')}`;
      this.materialLibService.getResourceDetail(this.id, this.coursewareType).subscribe(result => {
        if (result.status === 200) {
          this.initializeForm(result.data);
        }
      }, error => {
        this.message.warning(JSON.stringify(error));
      });
    }
  }

  getContentLength(title) {
    return title.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, 'a').replace(/\s/g, 'a').replace(/[\u0391-\uFFE5]/g, 'a').length;
  }


  mouseDownLabel() {
    if (!this.dailDownMove[this.current].init) {
      this.dailDownMove[this.current].init = true;
      this.domMoveHandler[this.current].addEventListener('mousedown', this.startMove);
      this.domMoveHandler[this.current].addEventListener('mouseup', this.endMove);
    }
  }


  endMove(e) {
    const that = (this as any).that;
    that.dailDownMove[that.current].isDown = false;
  }

  startMove(e) {
    const that = (this as any).that;
    const domEdit = that.domEdit[that.current] as HTMLDivElement;
    if (!that['dailDown' + that.current]) {
      return;
    }
    const event = e || that.win.event;
    that.dailDownMove[that.current].leftCha =
      event.clientX - domEdit.offsetLeft;
    that.dailDownMove[that.current].topCha =
      event.clientY - domEdit.offsetTop;
    that.dailDownMove[that.current].isDown = true;
  }


  nailDown(i: any) {
    this.current = i;
    if (!this.dom[i]) {
      this.dom[i] = this.doc.getElementById('editor' + i);
      this.domEdit[i] = this.dom[i].querySelectorAll(' .ck-editor__top.ck-reset_all')[0] as HTMLDivElement;
      this.domContainer[i] = this.dom[i].querySelectorAll('.ck.ck-editor__main')[0];
      this.domIcon[i] = this.doc.getElementById('editor-icon' + i);
      this.domIconOut[i] = this.doc.getElementById('editor-icon-out' + i);
      this.domMoveHandler[i] = this.doc.getElementById('moveHandler' + i);
      this.domEdit[i].that = this;
      this.domMoveHandler[i].that = this;
    }
    this.mouseDownLabel();
    this['dailDown' + i] = !this['dailDown' + i];
    if (this['dailDown' + i]) {
      this.fixStyles(i);
    } else {
      this.resetStyle(i);
    }
  }

  fixStyles(i) {
    this.renderer2.setStyle(this.domContainer[i], 'margin-top', this.domEdit[i].offsetHeight + 'px');
    this.renderer2.setStyle(this.domEdit[i], 'border-bottom', '1px solid #ccc');
    this.fixStyle(this.domIcon[i]);
    this.fixStyle(this.domIconOut[i]);
    this.fixStyle(this.domEdit[i]);
    this.fixStyle(this.domMoveHandler[i]);
  }

  resetStyle(i) {
    const {renderer2} = this;
    renderer2.removeAttribute(this.domContainer[i], 'style');
    renderer2.removeAttribute(this.domIconOut[i], 'style');
    renderer2.removeAttribute(this.domIcon[i], 'style');
    renderer2.removeAttribute(this.domEdit[i], 'style');
    renderer2.removeAttribute(this.domMoveHandler[i], 'style');
  }

  nailMove(e) {
    const that = (window as any).that;
    const event = e || that.win.event;
    Object.keys(that.dailDownMove).every((ee, ii) => {
      if (that.dailDownMove[ee].isDown) {
        const dom = that.doc.getElementById('editor' + ii);
        const domEdit = dom.querySelectorAll(' .ck-editor__top.ck-reset_all')[0] as HTMLDivElement;
        const domIcon = that.doc.getElementById('editor-icon' + ii);
        const domIconOut = that.doc.getElementById('editor-icon-out' + ii);
        const moveHandler = that.doc.getElementById('moveHandler' + ii);
        [domIcon, domIconOut, domEdit, moveHandler].forEach((domItem, domIndex) => {
          if (domIndex === 2) {
            domItem.style.left =
              event.clientX - that.dailDownMove[ee].leftCha + 'px';
            domItem.style.top =
              event.clientY - that.dailDownMove[ee].topCha + 'px';
          } else if (domIndex === 3) {
            domItem.style.left =
              event.clientX -
              that.dailDownMove[ee].leftCha +
              (domEdit.offsetWidth / 2) -
              (that.domMoveHandler[ee].offsetWidth / 2) +
              'px';
            domItem.style.top =
              event.clientY - that.dailDownMove[ee].topCha - 17 + 'px';
          } else {
            domItem.style.left =
              event.clientX -
              that.dailDownMove[ee].leftCha +
              domEdit.offsetWidth +
              'px';
            domItem.style.top =
              event.clientY - that.dailDownMove[ee].topCha + 'px';
          }
        });
        return;
      } else {
        return true;
      }
    });
  }

  fixStyle(dom) {
    const width = dom.offsetWidth + 'px';
    const top = dom.getBoundingClientRect().top + 'px';
    const left = dom.getBoundingClientRect().left + 'px';
    const {renderer2} = this;
    renderer2.setStyle(dom, 'position', 'fixed');
    renderer2.setStyle(dom, 'background', 'white');
    renderer2.setStyle(dom, 'z-index', '999');
    renderer2.setStyle(dom, 'width', width);
    renderer2.setStyle(dom, 'top', top);
    renderer2.setStyle(dom, 'left', left);
    renderer2.setStyle(dom, 'transform', 'inherit');
  }

  getImgVideoReosolver(label) {
    return {
      videoUpload: this.getResolver(label),
      imageUpload: this.getResolver(label)
    };
  }

  getResolver(label) {
    const that = this;
    return (file) => {
      that[label] = true;
      return new Promise((resolve, reject) => {
        const success = (url) => {
          that[label] = false;
          if (url) {
            resolve({url: environment.OSS_URL + url});
          } else {
            that.message.warning('上传失败');
          }
        };
        const error = (err) => {
          that[label] = false;
          that.message.warning('上传失败');
          reject(err);
        };
        that.uploadOssService
          .uploadOss(file, UploadDir.editor)
          .subscribe(success, error);
      });
    };
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
    const {coursewareType, isEdit} = this;
    const {id, title, learningGoalCode, background, guide, analysis, attachment, authorName} = data;
    this.validateForm = this.fb.group({
      id: [isEdit ? id : ''],
      points: [[]], // [知识点id]
      type: [coursewareType], // 资源种类
      coursewareType: [coursewareType], // 素材类型
      title: [isEdit ? title : '', [Validators.required, spaceValidator(), Validators.maxLength(30)]], // 资源名称
      learningGoalCode: [isEdit ? learningGoalCode : '', [Validators.required]], // 学习目标
      background: [isEdit ? background : '', [Validators.required]], // 背景
      guide: [isEdit ? guide : ''], // 教学指导
      analysis: [isEdit ? analysis : ''], // 解析
      caseAttanmentArr: [isEdit ? attachment.map(ele => ({
        name: ele.attachmentName,
        path: ele.attachmentPath,
        title: ele.attachmentName
      })) : []],
      authorName: [isEdit ? authorName :
        (this.orgCode === 'zksd' ? '考拉日记' : '恒企教育'), [Validators.required, spaceValidator(), Validators.maxLength(30)]],
    });
    if (isEdit && data.resourcePoints[0].knowledgePointId) {
      this.knowledgePointIds = this.defaultTreeKey = data.resourcePoints.map(({knowledgePointId}) => knowledgePointId);
    }
  }

  submitForm(): void {
    const {background, analysis, guide} = this.validateForm.value;
    // tslint:disable-next-line:forin
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if (this.validateForm.invalid) {
      this.message.warning('请按规则填写所有必填项');
      return;
    }
    if (this.getContentLength(background) > 5000) {
      this.message.warning('案例背景已超出限制');
      return;
    }
    if (this.getContentLength(analysis) > 5000) {
      this.message.warning('案例解析已超出限制');
      return;
    }
    if (this.getContentLength(guide) > 5000) {
      this.message.warning('教学指导内容已超出限制');
      return;
    }
    const postData = JSON.parse(JSON.stringify(this.validateForm.value));
    // 回显和点击树有数据
    if (this.knowledgePointIds.length) {
      postData.pointType = 1;
      postData.points = this.knowledgePointIds.map((ele: string) => ele);
    } else {
      postData.pointType = 2;
      postData.points = [this.treeknowledge.nodes[0].id];
    }
    const caseAttach = postData.caseAttanmentArr.map(ele => ({
      attachmentName: ele.name,
      attachmentPath: ele.path,
      aattachmentExt: ToolsUtil.getExt(ele.path),
      attachmentType: 12
    }));
    postData.attachments = [...caseAttach];
    delete postData.caseAttanmentArr;
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
          }
        });
      } else {
        this.savaRecourse(postData);
      }
    }
  }


  savaRecourse(postData): Promise<boolean> {
    return new Promise((resolve) => {
      this.saveLoading = true;
      this.materialLibService.saveCase(postData).subscribe(result => {
        this.saveLoading = false;
        if (result.status === 201) {
          resolve(true);
          this.goBack();
        } else {
          if (result.status === 500) {
            this.message.error('服务器业务异常');
          }
          resolve(false);
        }
      }, err => {
        resolve(false);
        this.saveLoading = false;
        this.message.error(JSON.stringify(err));
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
      url: '/m/rm/case',
      paramUrl: '',
      title: '案例库'
    });
  }


  stopPropagation(event) {
    if (event.keyCode === 13) {
      event.stopPropagation();
      return false;
    }
  }
}
