import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Renderer2,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {NzResizeEvent} from 'ng-zorro-antd/resizable';
import {NzMessageService, NzModalRef, NzModalService, NzTreeNodeOptions, UploadXHRArgs} from 'ng-zorro-antd';
import {FormBuilder, Validators} from '@angular/forms';
import ClassicEditor from '@xccjh/xccjh-ckeditor5-video-file-upload';
import {environment} from 'src/environments/environment';
import {UploadDir} from 'core/utils/uploadDir';
import {queryParam, ToolsUtil} from 'core/utils/tools.util';
import {interval, Observable, Subscription, timer} from 'rxjs';
import {UploadOssService} from 'core/services/upload-oss.service';
import {MenuService} from 'core/services/menu.service';
import {ActivatedRoute} from '@angular/router';
import {KnowledgeManageService} from '@app/busi-services/knowledge-manag.service';
import {HttpHeaders, HttpResponse} from '@angular/common/http';
import {NotifyService} from 'core/services/notify.service';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragMove,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray
} from '@angular/cdk/drag-drop';
import {ViewportRuler} from '@angular/cdk/overlay';

import {hex_sha1} from 'core/utils/sha1';
import {CourseManageService} from '@app/busi-services';
import {DomSanitizer} from '@angular/platform-browser';
import {EDITOR_CONFIG} from 'core/base/static-data';
import {APPROVE_MAP} from 'core/base/static-data';
import {getFileThumbUrl} from 'core/utils/common';
import {ConfirmableFlat} from 'core/decorators';
import {LoadingControl} from 'core/base/common';
import {SessionStorageUtil} from '../../../../../core/utils/sessionstorage.util';


@Component({
  selector: 'app-structure',
  templateUrl: './structure.component.html',
  styleUrls: ['./structure.component.less'],
})
export class StructureComponent implements OnInit, OnDestroy, AfterViewInit {
  width;
  isShow = false;
  resourceUrl;
  id = -1;
  selectedProfesson: any;
  kType = '1';
  pid = '';
  defaultCheckedKeys: string[] = [];
  examWeightInThisChapter = '';
  validateForm: any;
  polyway: any;
  localVideo: any;
  modalFormRef: NzModalRef;
  Editor = ClassicEditor;
  init = false;
  knowledgeUploading = false;
  isEditLoading = false;
  loading = false;
  localUploadKnowledge: any;
  previewUrl: any;
  knowledgeSubjectId;
  teacherList = [];
  previewVisible = false;
  ossUrl = environment.OSS_URL;
  isDone = '';
  polywayId: any;
  isPreviewpolyway = false;
  previewStart = false;
  previewTitle = '';
  fullscreen = false;
  modalWidth: 1000 | '100%' = 1000;
  modalBodyStyle = {padding: 0, height: '600px'};
  visible = true;
  isdisabled = false;
  curNode: NzTreeNodeOptions;
  courseId = '';
  status = '0';
  afterOpen = new EventEmitter<any>();
  subscriber = new EventEmitter<any>();
  uploadPercent = 0;
  auditStatus = '0';
  uploading = false;
  percent = 0;
  addKnowledgePoints = 0;
  delKnowledgePoints = 0;
  code = '';
  name = '';
  isExpandAll = true;
  isSaveing = false;
  exportloading = false;
  exportKnoLoading = false;
  showTree = true;
  initData = {
    keyLevel: 1,
    isSprint: false,
    isFinal: false,
    isDone: false,
    isStable: false,
    content: '',
    code: '',
    opsType: 0,
    id: '',
    learningMaterials: [],
    explanationVideo: []
  };
  searchValueOrigin = '';
  config = Object.assign({}, EDITOR_CONFIG, this.getImgVideoReosolver('isEditLoading'));
  private afterOpen$: Subscription;
  private timer$: Subscription;
  private reset = true;
  public target: CdkDropList;
  public targetIndex: number;
  public source;
  public sourceIndex: number;
  public activeContainer;
  private explanationVideo = []; // 切换知识点用来对比讲解视频视频是否发生了更改
  private learningMaterials = []; // 切换知识点用来对比学资料是否发生了更改

  get showLocalUpload() {
    return typeof this.localVideo.value.videoUrl !== 'string';
  }

  get searchValue() {
    return this.searchValueOrigin.trim();
  }

  set searchValue(val) {
    this.searchValueOrigin = val;
  }

  @ViewChild('localuploadmodal')
  localuploadmodal: TemplateRef<any>;
  @ViewChild('polywaymodal')
  polywayModal: TemplateRef<any>;
  @ViewChild('localvideomodal')
  localVideoModal: TemplateRef<any>;
  @ViewChild('tree')
  treeComponent;
  @ViewChild('treeContainer')
  treeContainer: ElementRef<any>;
  @ViewChild('qkcupload')
  qkcupload: any;
  @ViewChild('nailingTmp')
  nailingTmp: TemplateRef<any>;
  @ViewChild('listGroupexplanationVideo', {read: CdkDropListGroup, static: true})
  listGroupexplanationVideo: CdkDropListGroup<CdkDropList>;
  @ViewChild('listGrouplearningMaterials', {read: CdkDropListGroup, static: true})
  listGrouplearningMaterials: CdkDropListGroup<CdkDropList>;
  @ViewChild('placeholderexplanationVideo', {read: CdkDropList, static: true})
  placeholderexplanationVideo: CdkDropList;
  @ViewChild('placeholderlearningMaterials', {read: CdkDropList, static: true})
  placeholderlearningMaterials: CdkDropList;


  constructor(private fb: FormBuilder,
              private route: ActivatedRoute,
              private message: NzMessageService,
              private uploadOssService: UploadOssService,
              private modalService: NzModalService,
              private menuService: MenuService,
              private knowledgeManageService: KnowledgeManageService,
              private notifyService: NotifyService,
              private courseMgService: CourseManageService,
              private sanitizer: DomSanitizer,
              private renderer2: Renderer2,
              private viewportRuler: ViewportRuler
  ) {
    this.target = null;
    this.source = null;
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.knowledgeSubjectId = params.get('knowledgeSubjectId');
      this.courseId = params.get('courseId');
      this.status = params.get('status');
      this.auditStatus = params.get('auditStatus');
      this.name = SessionStorageUtil.getCourseName();
      this.code = params.get('code');
      this.professionChange({
        id: this.knowledgeSubjectId,
      });
    });
    this.afterOpen$ = this.afterOpen.subscribe(res => {
      this.localUploadKnowledge.patchValue({
        excelUrl: '',
      });
      this.qkcupload.nzFileList = [];
    });
    // this.getTeacher();
    this.initForm();
    // this.subscriber.subscribe(res => {
    //   // this.qkcupload.imageList = [];
    // });
  }


  ngAfterViewInit() {
    const placeholderExplanationVideo = this.placeholderexplanationVideo.element.nativeElement;
    const placeholderlearningMaterials = this.placeholderlearningMaterials.element.nativeElement;
    this.renderer2.setStyle(placeholderlearningMaterials, 'display', 'none');
    this.renderer2.setStyle(placeholderExplanationVideo, 'display', 'none');
    placeholderExplanationVideo.parentNode.removeChild(placeholderExplanationVideo);
    placeholderlearningMaterials.parentNode.removeChild(placeholderlearningMaterials);
  }


  ngOnDestroy() {
    this.afterOpen$.unsubscribe();
  }

  getMaxSeq() {
    let seq = 0;
    const arr = this.validateForm.value.explanationVideo;
    if (arr.length) {
      arr.forEach(item => {
        if (seq < item.seq) {
          seq = item.seq;
        }
      });
    }
    return seq + 1;
  }

  initForm() {
    this.validateForm = this.fb.group({
      keyLevel: [1],
      isSprint: [false],
      isFinal: [false],
      isDone: [false],
      isStable: [false],
      content: [''],
      code: [''],
      opsType: [0],
      id: [''],
      learningMaterials: [[]],
      explanationVideo: [[]],
    });
    this.polyway = this.fb.group({
      videoUrl: ['', [Validators.required]],
      // teacherId: ['', [Validators.required]],
      seq: ['1', [Validators.required]],
      id: [''],
      attachmentName: ['', [Validators.required]]
    });
    this.localVideo = this.fb.group({
      videoUrl: [[], [Validators.required]],
      // teacherId: ['', [Validators.required]],
      seq: ['1', [Validators.required]],
      id: [''],
      attachmentName: ['', [Validators.required]]
    });
    this.localUploadKnowledge = this.fb.group({
      excelUrl: [''],
    });
  }

  expendKnowledgeGraph() {
    this.isExpandAll = false;
    this.searchValue = '';
    timer(0).subscribe(() => {
      this.isExpandAll = true;
    });
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


  filterKnowledgePoints(params, e) {
    this.isDone = params;
    e.preventDefault();
    e.stopPropagation();
    this.treeComponent.getKnowledgeTree(this.selectedProfesson.id, this.isDone, true);
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

  professionChange(item: any): void {
    this.selectedProfesson = item;
    this.defaultCheckedKeys = [item.id];
  }

  nodeChange(node: NzTreeNodeOptions) {
    if (this.curNode && this.curNode.origin && (this.curNode.origin.kType === '2' || this.curNode.origin.kType === '4')) {
      if (node.origin.id === this.curNode.origin.id) {
        return;
      }
      const {kType, weight} = this.curNode.origin;
      if (kType === '2') {
        this.crossFlow(weight === this.examWeightInThisChapter, node);
      } else if (kType === '4') {
        this.crossFlow(!this.checkChange(this.curNode), node);
      }
    } else {
      this.curNode = node;
      this.recoveryData(node);
    }
  }

  // 切换是否保存知识点分流
  crossFlow(flag, node) {
    if (flag) {
      this.curNode = node;
      this.recoveryData(node);
    } else {
      this.saveKnowledgePoints(true, true).then((flagP) => {
        if (flagP) {
          this.curNode = node;
          this.recoveryData(node);
        }
      });
    }
  }

// 点击知识点回显详情
  recoveryData(node) {
    const nodeOpt = node.origin;
    this.kType = nodeOpt.kType;
    this.pid = nodeOpt.id;
    if (!nodeOpt.isEdit) { // 新增重置，点击回显，编辑不变
      if (this.kType === '4' && nodeOpt.id && nodeOpt.code !== this.validateForm.value.code) {
        this.treeComponent.isLoading = true;
        this.isSaveing = true;
        this.knowledgeManageService.detailKnowledge({id: this.pid}).subscribe(res => {
          if (res.status === 200) {
            if (res.data.content) {
              // 处理空格统计字数问题
              res.data.content = res.data.content.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>');
            }
            this.validateForm.patchValue({
              ...this.initData, ...res.data
            });
            const {explanationVideo, learningMaterials} = this.recoverMaterial(res.data.fileList);
            this.validateForm.patchValue({
              explanationVideo,
              learningMaterials
            });
            this.explanationVideo = JSON.parse(JSON.stringify(explanationVideo));
            this.learningMaterials = JSON.parse(JSON.stringify(learningMaterials));
          }
          this.treeComponent.isLoading = false;
          this.isSaveing = false;
        }, () => {
          this.treeComponent.isLoading = false;
          this.isSaveing = false;
        });
      } else if (this.kType !== '4') {
        this.validateForm.patchValue(
          this.initData
        );
        this.explanationVideo = [];
        this.learningMaterials = [];
      }
      if (this.kType === '2') {
        this.examWeightInThisChapter = nodeOpt.weight;
      } else {
        this.examWeightInThisChapter = '';
      }
    }
  }

  recoverMaterial(fileList) {
    const explanationVideo = [];
    const learningMaterials = [];

    fileList.forEach(e => {
      if (e.fileType === 1) {
        const obj: any = {
          attachmentName: e.attachmentName,
          // teacherId: e.teacherId,
          seq: e.seq,
          id: e.id
        };
        if (e.attachmentPath.indexOf('.') < 0) {
          obj.videoUrl = e.attachmentPath;
        } else {
          obj.videoUrl = [{
            name: e.attachmentName,
            title: e.attachmentName,
            path: e.attachmentPath,
          }];
        }
        explanationVideo.push(obj);
      } else {
        const obj = {
          path: e.attachmentPath,
          name: e.attachmentName,
          title: e.attachmentName,
          seq: e.seq,
          id: e.id
        };
        learningMaterials.push(obj);
      }
    });
    learningMaterials.sort((a: any, b: any) => {
      return a.seq - b.seq;
    });
    explanationVideo.sort((a: any, b: any) => {
      return a.seq - b.seq;
    });
    return {learningMaterials, explanationVideo};
  }


  exportMap() {
    this.exportloading = true;
    this.knowledgeManageService.exportExcel(this.knowledgeSubjectId).subscribe((resp: HttpResponse<Blob>) => {
        const headers: HttpHeaders = resp.headers;
        // (window as any).aa=headers.get('content-disposition').split('=')[1];
        // console.log(headers.get('content-disposition').split('=')[1]);
        const link = document.createElement('a');
        // 支持HTML5下载属性的浏览器
        const url = URL.createObjectURL(resp.body);
        link.setAttribute('href', url);
        link.setAttribute('download', '知识图谱.xls');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.exportloading = false;
      },
      (error) => {
        this.message.error(JSON.stringify(error));
        this.exportloading = false;
      });
  }

  importAtlas() {
    this.modalFormRef = this.modalService.create({
      nzTitle: '导入图谱',
      nzContent: this.localuploadmodal,
      nzMaskClosable: false,
      nzWrapClassName: 'vertical-center-modal',
      nzCancelText: '取消',
      nzOkText: '确定上传',
      nzAfterOpen: this.afterOpen,
      nzOnCancel: (e) => {
        if (this.knowledgeUploading) {
          this.message.warning('正在导入知识图谱请不要中途退出');
          return false;
        }
      },
      nzOnOk: (e) => {
        return new Promise((resolve) => {
          const excelUrl = this.localUploadKnowledge.value.excelUrl;
          if (!excelUrl) {
            this.message.warning('请上传文件后导入');
            resolve(false);
            return;
          }
          this.loading = true;
          this.knowledgeManageService.importKnowledge(this.knowledgeSubjectId, excelUrl).subscribe(res => {
              if (res.status === 201) {
                this.message.success('格式校验通过开始进行导入操作,请不要中途退出');
                this.timer$ = timer(0, 1000).subscribe(() => {
                  this.queryProgress(resolve);
                });
              } else {
                this.loading = false;
                resolve(false);
              }
            }, err => {
              this.loading = false;
              resolve(false);
            }
          );
        });

      }
    });
  }

// 批量导入
  queryProgress(resolve) {
    this.knowledgeManageService.queryProgress(this.knowledgeSubjectId).subscribe(resP => {
      if (resP.status === 200) {
        this.knowledgeUploading = true;
        if (resP.data.isDone) {
          this.uploadPercent = 100;
          this.timer$.unsubscribe();
          this.showTree = false;
          timer(1000).subscribe(() => {
            this.showTree = true;
            this.knowledgeUploading = false;
            this.uploadPercent = 0;
            this.loading = false;
            this.message.success('批量导入成功');
            resolve(true);
          });
          console.log('完成');
        } else {
          this.uploadPercent = Math.floor(resP.data.percent * 100);
          console.log(this.uploadPercent);
        }
      } else {
        this.message.error('服务器中途出错了，请稍后再试');
        this.loading = false;
        resolve(false);
      }
    });
  }


  goback() {
    this.menuService.goBack(false);
    this.menuService.gotoUrl({
      url: '/m/course-manage/course-list',
      paramUrl: ``,
      title: '课程管理'
    });
  }

  uploadExplanationVideo(label, reset = true) {
    this.reset = reset;
    if (reset) { // 新增
      this[label].patchValue({
        videoUrl: label === 'localVideo' ? [] : '',
        seq: this.getMaxSeq(),
        attachmentName: '',
        id: ''
      });
    }
    for (const i in this[label].controls) {
      if (this[label].controls.hasOwnProperty(i)) {
        this[label].controls[i].markAsUntouched();
        this[label].controls[i].markAsPristine();
        this[label].controls[i].updateValueAndValidity();
      }
    }
    this.modalFormRef = this.modalService.create({
      nzTitle: label === 'localVideo' ? '本地上传' : '保利威',
      nzContent: label === 'localVideo' ? this.localVideoModal : this.polywayModal,
      nzMaskClosable: false,
      nzWrapClassName: 'vertical-center-modal',
      nzCancelText: '取消',
      nzOkText: '保存',
      nzAfterOpen: this.subscriber,
      nzOnOk: (e) => {
        return this.confirmUpload(label);
      }
    });
  }


  confirmUpload(label) {
    return new Promise((resolve, reject) => {
      for (const i in this[label].controls) {
        if (this[label].controls.hasOwnProperty(i)) {
          this[label].controls[i].markAsDirty();
          this[label].controls[i].updateValueAndValidity();
        }
      }
      if (this[label].invalid) {
        this.message.warning('请按规则填写所有必填项');
        resolve(false);
        return;
      }
      const edit = {
        index: 0
      };
      const pre = this.validateForm.value.explanationVideo;
      if (pre.length) {
        if (!this.verifySameName(pre, label, edit, this.reset)) {
          resolve(false);
          return;
        }
      }
      if (label === 'polyway') {
        const params: any = {
          ptime: (new Date()).getTime(),
          vids: this[label].value.videoUrl,
        };
        const sign = hex_sha1(queryParam(params) + environment.secretkey);
        params.sign = sign.toUpperCase();
        this.courseMgService.getVideoLength(params, environment.userid).subscribe(res => {
          if (res.code === 200) {
            if (res.data.length) {
              this.storingData(this.reset, pre, label, edit.index);
              resolve(true);
            } else {
              this.message.warning('请填写正确的视频ID');
              resolve(false);
            }
          } else {
            this.message.warning('请填写正确的视频ID');
            resolve(false);
          }
        }, err => {
          this.message.warning('保利威id校验服务异常,请稍后再试');
          resolve(false);
        });
      } else {
        this.storingData(this.reset, pre, label, edit.index);
        resolve(true);
      }
    });
  }

  /**
   * 判断是否已经存在同地址或同名的数据
   * @param pre 已经存在的数据
   * @param label  类型
   * @param edit 找到编辑对应的索引
   * @param reset 新增/编辑
   */
  verifySameName(pre, label, edit, reset) {
    // 判断是否跟存在数据同地址
    const flag = pre.every((ee, ii) => {
      // 编辑状态且是对应项 (对应项改动跳过本项同名校验)
      const editself = (!reset) && ee.id === this[label].value.id;
      if (editself) {
        return true
      } else {
        let flag2;
        // 编辑状态下其他项或新增状态下
        if (label === 'polyway') {
          flag2 = (ee.videoUrl === this[label].value.videoUrl);
        } else {
          flag2 = (ee.videoUrl[0].path === this[label].value.videoUrl[0].path);
        }
        if (flag2) { // 找到同地址项索引
          edit.index = ii;
        } else {
          return true;
        }
      }
    });
    if (!flag) { // 新增状态下有同名项
      this.message.warning(label === 'localVideo' ? '讲解视频已经存在同地址视频' : '讲解视频已经存在该id视频');
      return false;
    }


    // 判断是否跟存在数据同名
    const flag3 = pre.every((value) => {
      const editself = (!reset) && value.id === this[label].value.id;
      const isSame = value.attachmentName !== this[label].value.attachmentName;
      if (editself || isSame) { // 编辑状态且是对应项跳过本项同名校验   或   不同名跳过
        return true;
      }
    });

    if (!flag3) {
      this.message.warning('讲解视频已经存在该视频名称，请更换名称');
    } else {
      return true;
    }

  }

  storingData(reset, pre, label, editIndex) {
    if (reset) {
      this[label].value.id = this.randomString();
      this.validateForm.patchValue({
        explanationVideo: [...pre, this[label].value]
      });
    } else { // 编辑
      const {
        videoUrl,
        seq,
        attachmentName
      } = this[label].value;
      pre[editIndex].seq = seq;
      pre[editIndex].attachmentName = attachmentName;
      pre[editIndex].videoUrl = videoUrl;
      pre.sort((a: any, b: any) => {
        return a.seq - b.seq;
      });
      this.validateForm.patchValue({
        explanationVideo: pre
      });
    }
    this.modalFormRef.destroy();
  }

  beforeKnowledgeUpload() {
    const thisObj = this;
    return (file: any) => {
      const type = ToolsUtil.getFileType(file.name);
      if (type !== 'excel') {
        thisObj.message.error('请上传excel,支持后缀xls, xlsx');
        return false;
      } else {
        return new Observable<boolean>((observe) => {
          observe.next(true);
        });
      }
    };
  }

  customKnowledgeRequest() {
    const thisObj = this;
    return (item: UploadXHRArgs) => {
      this.loading = true;
      const success = (result) => {
        this.loading = false;
        this.localUploadKnowledge.patchValue({
          excelUrl: result,
        });
        item.onSuccess({...item}, item.file, {});
      };
      const fail = (err) => {
        this.loading = false;
        item.onError(err, item.file);
        thisObj.message.error(JSON.stringify(err));
      };
      thisObj.uploadOssService
        .uploadOss(item.file, UploadDir.knowledge_file)
        .subscribe(success, fail);
    };
  }


  @ConfirmableFlat({
      title(args) {
        return args[1] ? '重新提交' : '提交审批';
      },
      content(args) {
        return '确定对标准状态的' + args[0] + '课程' + (args[1] ? '重新' : '') + '提交审批吗？';

      },
    }
  )
  submitForApproval(title: string, auditStatus: boolean, loadingControl?: LoadingControl) {
    return new Promise((resolve) => {
      loadingControl.loading = true;
      this.knowledgeManageService.approveAll({
        courseId: this.courseId,
        action: APPROVE_MAP[5]
      }).subscribe(res => {
        loadingControl.loading = false;
        if (res.status === 201) {
          resolve(true);
          this.menuService.goBack(false);
          this.menuService.gotoUrl({
            url: '/m/course-manage/course-list',
            paramUrl: '',
            title: '课程管理'
          });
        } else {
          resolve(false);
          if (res.status === 500) {
            this.message.error('服务器业务异常');
          }
        }
      }, (error) => {
        resolve(false);
        loadingControl.loading = false;
        this.message.error(JSON.stringify(error));

      });
    });
  }

  examWeightInThisChapterChange(examWeightInThisChapter) {
    this.examWeightInThisChapter = examWeightInThisChapter;
  }

  private getTeacher() {
    this.knowledgeManageService.getTeacher().subscribe(res => {
      if (res.status === 200) {
        this.teacherList = res.data;
      }
    });
  }

  private randomString(e?) {
    e = e || 32;
    const t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    const a = t.length;
    let n = '';
    for (let i = 0; i < e; i++) {
      n += t.charAt(Math.floor(Math.random() * a));
    }
    return n;
  }


  removeFileItem(item) {
    if (item.path) {
      const data = this.validateForm.value.learningMaterials;
      if (data.length) {
        data.every((ee, ii) => {
          if (Object.is(ee.path, item.path)) {
            data.splice(ii, 1);
            this.validateForm.patchValue({
              learningMaterials: data
            });
          } else {
            return true;
          }
        });
      }
    } else {
      const data = this.validateForm.value.explanationVideo;
      if (data.length) {
        data.every((ee, ii) => {
          if (Object.is(ee.id, item.id)) {
            data.splice(ii, 1);
            this.validateForm.patchValue({
              explanationVideo: data
            });
          } else {
            return true;
          }
        });
      }
    }
  }

  formatProgress(percent) {
    return Math.trunc(percent) + '%';
  }

  editItem(itemFile) {
    if (typeof itemFile.videoUrl === 'string' && itemFile.videoUrl.indexOf('.') < 0) {
      this.polyway.patchValue(itemFile);
      this.uploadExplanationVideo('polyway', false);
    } else {
      this.localVideo.patchValue(itemFile);
      this.uploadExplanationVideo('localVideo', false);
    }
  }

  previewItem(itemFile: any) {
    if (typeof itemFile.videoUrl === 'string' && itemFile.videoUrl.indexOf('.') < 0) {
      this.isPreviewpolyway = true;
      this.resourceUrl = itemFile.videoUrl;
      this.previewTitle = '';
      this.previewStart = true;
    } else {
      this.isPreviewpolyway = false;
      if (typeof itemFile.videoUrl === 'string' && itemFile.videoUrl.indexOf('.') > -1) {
        this.resourceUrl = this.ossUrl + itemFile.videoUrl;
        this.previewTitle = itemFile.title;
      } else {
        if (itemFile.path) {
          this.resourceUrl = this.ossUrl + itemFile.path;
          this.previewTitle = itemFile.title;
        } else {
          this.resourceUrl = this.ossUrl + itemFile.videoUrl[0].path;
          this.previewTitle = itemFile.videoUrl[0].title;
        }
      }
      this.resourceUrl = environment.ow365 + this.resourceUrl;
      this.previewStart = true;
    }
  }

  closePreview() {
    this.isPreviewpolyway = false;
    this.resourceUrl = '';
    this.previewTitle = '';
    this.previewStart = false;
  }


  downloadTemplate() {
    location.href = this.ossUrl + '/template/scholar/知识图谱导入模板.xls';
  }

  // 切换保存知识点
  saveKnowledgePoints(request = true, check = true) {
    this.isSaveing = true;
    return new Promise((resolve) => {
      this.treeComponent.saveNode(this.curNode, request, check).subscribe((flagP) => {
        resolve(flagP);
        this.isSaveing = false;
      }, () => {
        resolve(false);
        this.isSaveing = false;
      });
    });
  }

  IfExist(params) {
    return Boolean(params);
  }

  getContentLength() {
    return this.validateForm.value.content.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, 'a')
      .replace(/\s/g, 'a').replace(/[\u0391-\uFFE5]/g, 'a').length;
  }


  removeFileSelf() {
    const that = this;
    const func = function() {
      that.localUploadKnowledge.patchValue({
        excelUrl: '',
      });
      this.nzFileList = [];
    };
    return func;
  }

  onInputVal(e) {
    const val = `${this.examWeightInThisChapter}`;
    const index = val.indexOf('.');
    if (index !== -1) {
      this.examWeightInThisChapter = val.slice(0, index);
    }
  }

  percentReport(percent) {
    this.percent = percent;
  }

  startUpload(param) {
    this.uploading = true;
  }

  // 获取放置的dropList实例
  dragMoved(e: CdkDragMove, label: 'explanationVideo' | 'learningMaterials') {
    const point = this.getPointerPositionOnPage(e.event);
    this['listGroup' + label]._items.forEach(dropList => {
      if (this.isInsideDropListClientRect(dropList, point.x, point.y)) {
        this.activeContainer = dropList;
        return;
      }
    });
  }

  // 判断dom是否再集合里面
  selfIndexOf(collection, node) {
    return Array.prototype.indexOf.call(collection, node);
  }

  // 确定事件是否为触摸事件
  isTouchEvent(event: MouseEvent | TouchEvent): event is TouchEvent {
    return event.type.startsWith('touch');
  }

  // 确定拖拽是否在容器内
  isInsideDropListClientRect(dropList: CdkDropList, x: number, y: number) {
    const {top, bottom, left, right} = dropList.element.nativeElement.getBoundingClientRect();
    return y >= top && y <= bottom && x >= left && x <= right;
  }

  // 确定用户触摸的页面的点
  getPointerPositionOnPage(event: MouseEvent | TouchEvent) {
    // 对于开始/结束事件，touch`将为空，因此我们必须返回到“changedTouches”
    const point = this.isTouchEvent(event) ? (event.touches[0] || event.changedTouches[0]) : event;
    const scrollPosition = this.viewportRuler.getViewportScrollPosition();

    return {
      x: point.pageX - scrollPosition.left,
      y: point.pageY - scrollPosition.top
    };
  }

  // 按住鼠标拖拽时,拖拽其他跟随挪一位方式，实时预览,控制哪些些以放置同时更新预览样式
  drag(label) {
    const that = this;
    return (drag: CdkDrag, drop: CdkDropList) => {
      // tslint:disable-next-line:triple-equals
      if (drop == that['placeholder' + label]) {
        return true;
      }
      // tslint:disable-next-line:triple-equals
      if (drop != this.activeContainer) {
        return false;
      }
      const phElement = that['placeholder' + label].element.nativeElement;
      const sourceElement = drag.dropContainer.element.nativeElement;
      const dropElement = drop.element.nativeElement;

      const dragIndex = that.selfIndexOf(
        dropElement.parentNode.children,
        that.source ? phElement : sourceElement
      );
      const dropIndex = that.selfIndexOf(
        dropElement.parentNode.children,
        dropElement
      );
      if (!that.source) {
        that.sourceIndex = dragIndex;
        that.source = drag.dropContainer;
        that.renderer2.setStyle(phElement, 'width', sourceElement.clientWidth + 'px');
        that.renderer2.setStyle(phElement, 'height', sourceElement.clientHeight + 'px');
        sourceElement.parentNode.removeChild(sourceElement);
      }

      that.targetIndex = dropIndex;
      that.target = drop;

      that.renderer2.setStyle(phElement, 'display', '');
      that.renderer2.insertBefore(dropElement.parentNode, phElement,
        (dropIndex > dragIndex ? dropElement.nextSibling : dropElement));
      that.source._dropListRef.start();
      that['placeholder' + label]._dropListRef.enter(
        drag._dragRef,
        drag.element.nativeElement.offsetLeft,
        drag.element.nativeElement.offsetTop
      );
      return false;
    };
  }

  // 松开鼠标防下时,拖拽其他跟随挪一位方式，实时预览
  drop(event: CdkDragDrop<{ item: number; index: number }, any>, label: string) {
    if (this.target) {
      const phElement = this['placeholder' + label].element.nativeElement;
      const parent = phElement.parentNode;
      this.renderer2.setStyle(phElement, 'display', 'none');
      this.renderer2.removeChild(parent, phElement);
      this.renderer2.appendChild(parent, phElement);
      this.renderer2.insertBefore(parent, this.source.element.nativeElement, parent.children[this.sourceIndex]);
      this.target = null;
      this.source = null;
      if (this.sourceIndex !== this.targetIndex) {
        const dataList = JSON.parse(JSON.stringify(this.validateForm.value[label]));
        moveItemInArray(dataList, this.sourceIndex, this.targetIndex);
        dataList.forEach((e, i) => {
          dataList[i].seq = i + 1;
        });
        this.validateForm.patchValue({
          [label]: dataList
        });
      }
    }
  }

  getRealPath(item) {
    let attachmentPath;
    if (typeof item.videoUrl === 'string' && item.videoUrl.indexOf('.') < 0) {
      attachmentPath = item.videoUrl;
    } else {
      if (item.path) {
        attachmentPath = item.path;
      } else {
        attachmentPath = item.videoUrl[0].path;
      }
    }
    return attachmentPath;
  }

  getPreview(item) {
    const attachmentPath = this.getRealPath(item);
    const ext = ToolsUtil.getExt(attachmentPath);
    if (this.isPicture(ext)) {
      return environment.OSS_URL + attachmentPath + '?x-oss-process=image/resize,m_fill,h_50,w_50';
    } else {
      return getFileThumbUrl(ext);
    }
  }

  isPictureItem(item) {
    const attachmentPath = this.getRealPath(item);
    const ext = ToolsUtil.getExt(attachmentPath);
    return this.isPicture(ext);
  }

  isPicture(ext: string) {
    const picExt = 'jpg,jpeg,png';
    return picExt.indexOf(ext) > -1;
  }

  // 拖拽drag和drop互换方式，拖拽过程其他不动
  // drop(event: CdkDragDrop<{ item: number; index: number }, any>, label: string) {
  //   const pre = event.previousContainer.data.index;
  //   const current = event.container.data.index;
  //   if (pre === current) {
  //     return;
  //   }
  //   const dataList = JSON.parse(JSON.stringify(this.validateForm.value[label]));
  //   const result = [];
  //   this.validateForm.value[label].forEach((item, index) => {
  //     if (index === current) {
  //       const obj = dataList[pre];
  //       obj.seq = index;
  //       result.push(obj);
  //     } else if (index === pre) {
  //       const obj = dataList[current];
  //       obj.seq = index;
  //       result.push(dataList[current]);
  //     } else {
  //       item.seq = index;
  //       result.push(item);
  //     }
  //   });
  //   this.validateForm.patchValue({
  //     [label]: result
  //   });
  // }

  optsChange(item: any) {
    this.localVideo.patchValue({
      attachmentName: item.name.split('.')[0]
    });
  }

  nailingApproval() {
    this.knowledgeManageService.getDetailApprove(this.knowledgeSubjectId).subscribe(res => {
      this.addKnowledgePoints = res.new;
      this.delKnowledgePoints = res.del;
      this.modalService.confirm({
        nzTitle: `知识图谱审批`,
        nzContent: this.nailingTmp,
        nzOnOk: () => {
          return new Promise((resolve) => {
            const param = {
              courseId: this.courseId,
              action: APPROVE_MAP[5]
            };
            this.knowledgeManageService.nailingApproval(param).subscribe(rest => {
              if (rest.status === 201) {
                resolve(true);
              } else {
                resolve(false);
              }
            }, err => {
              resolve(false);
            });
          });
        }
      });
    });

  }


  attachmentDifferenceCheck() { // 如果更改了return true
    const {
      learningMaterials,
      explanationVideo
    } = this.validateForm.value;
    if (learningMaterials.length !== this.learningMaterials.length || explanationVideo.length !== this.explanationVideo.length) {
      return true;
    }
    let flag1 = false; // 默认没改
    let flag2 = false; // 默认没改


    if (this.learningMaterials.length) {
      flag1 = learningMaterials.some((material) => { // 只要有一个改了 return true
        const checks: any = {};
        const checki: any = {};
        // const checkArr = ['name', 'path', 'seq', 'title'];
        const checkArr = ['seq'];
        checkArr.concat(['id']).forEach((item => {
          checks[item + 's'] = this.learningMaterials.map(e => e[item]);
          checki[item + 'i'] = checks[item + 's'].indexOf(material[item]);
        }));
        const Innerflag1 = Object.keys(checki).every((ev => { // 只要有一个改了return false
          return checki[ev] > -1;
        }));
        if (Innerflag1) { // 没改。需要继续校验对应项匹配
          return !(checkArr.every((evc => {
            return this.learningMaterials[checki.idi][evc] === material[evc]; // 只要有一个改了return true
          })));
        } else { // 改了，return true
          return true;
        }
      });
    }

    if (!flag1 && this.explanationVideo.length) { // 如果学习资料没改，继续校验讲解视频,如果有一个改了 return true
      flag2 = explanationVideo.some((explanation, explanationI) => { // 只要有一个改了 return true
        const checks: any = {};
        const checki: any = {};
        const checkArr = ['attachmentName', 'seq', 'videoUrl'];
        checkArr.concat(['id']).forEach((item => {
          checks[item + 's'] = this.explanationVideo.map(e => e[item]);
          if (typeof checks[item + 's'][explanationI] === 'object') {
            checki[item + 'i'] = checks[item + 's'].findIndex
            (explanationItem => explanation[item].path === explanationItem.path);
          } else {
            checki[item + 'i'] = checks[item + 's'].indexOf(explanation[item]);
          }
        }));
        const Innerflag1 = Object.keys(checki).every((evl => { // 只要有一个改了return false
          return checki[evl] > -1;
        }));
        if (Innerflag1) { // 没改。需要继续校验对应项匹配
          return !(checkArr.every((evcl => {
            if (typeof this.explanationVideo[checki.idi][evcl] === 'object') {
              return this.explanationVideo[checki.idi][evcl].path === explanation[evcl].path; // 只要有一个改了return true
            } else {
              return this.explanationVideo[checki.idi][evcl] === explanation[evcl]; // 只要有一个改了return true
            }
          })));
        } else { // 改了，return true
          return true;
        }
      });
    }
    return flag2 || flag1; // 只要有一个true说明改了
  }

  /**
   * 检查切换知识点是否有改动
   * @param node 树节点
   */
  private checkChange(node: NzTreeNodeOptions) {
    const {content, isDone, isFinal, isStable, isSprint, keyLevel, opsType} = node.origin;
    if ((content || '') !== this.validateForm.value.content
      || (isFinal || false) !== this.validateForm.value.isFinal
      || (isDone || false) !== this.validateForm.value.isDone
      || (isStable || false) !== this.validateForm.value.isStable
      || (opsType || 0) !== this.validateForm.value.opsType
      || (keyLevel || 1) !== this.validateForm.value.keyLevel
      || (isSprint || false) !== this.validateForm.value.isSprint
      || this.attachmentDifferenceCheck()) {
      return true;
    }
  }

  // 草稿删除接节点回调
  delete(nailedNode) {
    this.kType = '1';
    this.curNode = nailedNode;
  }

  exportKno() {
    this.exportKnoLoading = true;
    this.courseMgService.exportKno(this.courseId).subscribe((resp: HttpResponse<Blob>) => {
        const headers: HttpHeaders = resp.headers;
        // (window as any).aa=headers.get('content-disposition').split('=')[1];
        // console.log(headers.get('content-disposition').split('=')[1]);
        const link = document.createElement('a');
        // 支持HTML5下载属性的浏览器
        const url = URL.createObjectURL(resp.body);
        link.setAttribute('href', url);
        link.setAttribute('download', '课包知识点题目难度导出.xls');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.exportKnoLoading = false;
      },
      error => {
        this.message.error(JSON.stringify(error));
        this.exportKnoLoading = false;
      });
  }
}
