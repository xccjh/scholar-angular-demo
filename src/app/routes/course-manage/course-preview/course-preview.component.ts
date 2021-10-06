import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {ActivatedRoute} from '@angular/router';
import {ToolsUtil} from 'core/utils/tools.util';
import {NzMessageService, NzModalRef, NzTabChangeEvent, NzTreeNodeOptions} from 'ng-zorro-antd';
import {environment} from 'src/environments/environment';
import {FormBuilder, Validators} from '@angular/forms';
import {NzResizeEvent} from 'ng-zorro-antd/resizable';
import {UploadOssService} from 'core/services/upload-oss.service';
import {MenuService} from 'core/services/menu.service';
import {KnowledgeManageService} from '@app/busi-services/knowledge-manag.service';
import {timer} from 'rxjs';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {getFileThumbUrl} from 'core/utils/common';
import {UploadDir} from 'core/utils/uploadDir';
import {EDITOR_CONFIG} from 'core/base/static-data';
import ClassicEditor from '@xccjh/xccjh-ckeditor5-video-file-upload';
import {DOCUMENT} from '@angular/common';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';

declare const polyvObject: any;

@Component({
  selector: 'app-course-preview',
  templateUrl: './course-preview.component.html',
  styleUrls: ['./course-preview.component.less'],

})
export class CoursePreviewComponent implements OnInit {
  desColumn = {xxl: 3, xl: 3, lg: 3, md: 3, sm: 1, xs: 1};
  data: any = {};
  width;
  id = -1;
  selectedProfesson: any = {};
  kType = '';
  pid = '';
  defaultCheckedKeys: string[] = [];
  examWeightInThisChapter = '';
  validateForm: any;
  modalFormRef: NzModalRef;
  loading = false;
  isExpend = true;
  ossUrl = environment.OSS_URL;
  treeView = true;
  previewUrl: any;
  value: any;
  polywayId: any;
  visible = true;
  orgCode = ToolsUtil.getOrgCode();
  selectIndex = 0;
  type;
  auditStatus;
  resourceUrl: SafeResourceUrl = '';
  isPreviewpolyway = false;
  previewStart = false;
  previewTitle = '';
  previewVisible = false;
  Editor = ClassicEditor;
  isExpandAll = true;
  allNodes = true;
  config = Object.assign({}, EDITOR_CONFIG, this.getImgVideoReosolver('isEditLoading'));
  private isDone = '';
  @ViewChild('treeContainer') treeContainer: ElementRef;
  @ViewChild('tree') treeComponent;


  constructor(
    private route: ActivatedRoute,
    private courseMgService: CourseManageService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private uploadOssService: UploadOssService,
    private menuService: MenuService,
    private knowledgeManageService: KnowledgeManageService,
    private sanitizer: DomSanitizer,
    private renderer2: Renderer2,
    @Inject(DOCUMENT) private doc: Document
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.pid = params.get('id');
      this.getCourseDetail(this.pid);
    });
    this.route.queryParamMap.subscribe(params => {
      this.type = params.get('type');
    });
    const indexObj = SessionStorageUtil.getKnowledgeGraphTab();
    if (indexObj) {
      const index = JSON.parse(indexObj)[this.pid];
      if (index) {
        timer(0).subscribe(() => {
          this.selectIndex = Number(index);
        });
      }
    }
    this.validateForm = this.fb.group({
      keyLevel: [1, [Validators.required]],
      isSprint: [false, [Validators.required]],
      isFinal: [false, [Validators.required]],
      isDone: [false, [Validators.required]],
      isStable: [false, [Validators.required]],
      content: ['', [Validators.required]],
      code: ['', [Validators.required]],
      opsType: [0, [Validators.required]],
      id: [''],
      learningMaterials: [[], [Validators.required]],
      explanationVideo: [[], [Validators.required]],
    });
  }


  filterKnowledgePoints(params, e) {
    if (this.treeComponent.allNodes === params ) {
      return;
    }
    this.allNodes = params;
    e.preventDefault();
    e.stopPropagation();
    timer(0).subscribe(() => {
      this.treeComponent.getKnowledgeTree(this.selectedProfesson.id, '', true);
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


  examWeightInThisChapterChange(examWeightInThisChapter) {
    this.examWeightInThisChapter = examWeightInThisChapter;
  }

  randomString(e?) {
    e = e || 32;
    const t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    const a = t.length;
    let n = '';
    for (let i = 0; i < e; i++) {
      n += t.charAt(Math.floor(Math.random() * a));
    }
    return n;
  }

  nodeChange(nodeOpt: NzTreeNodeOptions) {
    this.kType = nodeOpt.kType;
    this.pid = nodeOpt.id;
    console.log(nodeOpt);
    if (!nodeOpt.isEdit) {
      if (this.kType === '4' && nodeOpt.id && nodeOpt.code !== this.validateForm.value.code) {
        this.knowledgeManageService.detailKnowledge({id: this.pid}).subscribe(res => {
          if (res.status === 200) {
            this.validateForm.patchValue(res.data);
            const explanationVideo = [];
            const learningMaterials = [];
            res.data.fileList.forEach(e => {
              if (e.fileType === 1) {
                const obj = {
                  videoUrl: e.attachmentPath,
                  teacherId: e.teacherId,
                  seq: e.seq,
                  id: this.randomString()
                };
                explanationVideo.push(obj);
              } else {
                const obj = {
                  path: e.attachmentPath,
                  name: e.attachmentName,
                  title: e.attachmentName,
                };
                learningMaterials.push(obj);
              }
            });
            this.validateForm.patchValue({
              explanationVideo,
              learningMaterials
            });
            console.log(this.validateForm.value);
          }
        });
      } else if (this.kType !== '4') {
        this.validateForm.patchValue({
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
        });
      }
      if (this.kType === '2') {
        this.examWeightInThisChapter = nodeOpt.weight;
      } else {
        this.examWeightInThisChapter = '';
      }
    }
  }


  getCourseDetail(id: string) {
    this.courseMgService.preview_course_new(id).subscribe(res => {
      if (res.status !== 200) {
        return;
      }
      this.data = res.data;
      this.data.courseDetail.introduction = this.data.courseDetail.introduction?.replaceAll('\n', '<br/>');
      this.defaultCheckedKeys = res.data.ocodes;
      this.selectedProfesson.id = res.data.knowledgeSubjectId;
      this.auditStatus = res.data.auditStatus;
    });
  }

  onResize({width, height}: NzResizeEvent): void {
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

  getName(videoUrl: any) {
    const pos = videoUrl.lastIndexOf('/');
    return videoUrl.substring(pos + 1);
  }


  closePreview() {
    this.isPreviewpolyway = false;
    this.resourceUrl = '';
    this.previewTitle = '';
    this.previewStart = false;
  }

  backtolist() {
    const type = SessionStorageUtil.getCourseType();
    this.menuService.goBack(false);
    if (type === '0') {
      this.menuService.gotoUrl({
        url: '/m/course-manage/course-list',
        paramUrl: ``,
        title: '课程管理'
      });
    } else if (type === '1') {
      this.menuService.gotoUrl({
        url: '/m/course-manage/i-initiated',
        paramUrl: ``,
        title: '我发起的'
      });
    } else {
      this.menuService.gotoUrl({
        url: '/m/course-manage/approve-all',
        paramUrl: ``,
        title: '全部审批'
      });
    }
    SessionStorageUtil.removeCourseType();
  }


  getPreview(attachmentPath) {
    const ext = ToolsUtil.getExt(attachmentPath);
    if (this.isPicture(ext)) {
      return environment.OSS_URL + attachmentPath + '?x-oss-process=image/resize,m_fill,h_50,w_50';
    } else {
      return getFileThumbUrl(ext);
    }
  }

  previewItem(itemFile: any) {
    if (itemFile.videoUrl.indexOf('.') < 0) {
      this.isPreviewpolyway = true;
      this.resourceUrl = itemFile.videoUrl;
      this.previewTitle = '';
      this.previewStart = true;
    } else {
      this.isPreviewpolyway = false;
      this.previewTitle = itemFile.title || '视频预览';
      this.resourceUrl = environment.ow365 + this.ossUrl + itemFile.videoUrl;
      this.previewStart = true;
    }
  }


  isPicture(ext: string) {
    const picExt = 'jpg,jpeg,png';
    return picExt.indexOf(ext) > -1;
  }


  getMajorList(data: any) {
    if (data) {
      if (ToolsUtil.getOrgCode() === 'cjsd') {
        return data.majorName;
      } else {
        return data.majorCourseList && data.majorCourseList.length && data.majorCourseList.map(e => e.majorName).join(', ');
      }
    }
  }

  getAduitMenberdata(data: any) {
    if (data && data.courseAuditUserList && data.courseAuditUserList.length) {
      return data.courseAuditUserList.map(e => e.userName).join(',');
    } else {
      return '该用户没有选择课程组成员';
    }
  }

  getExerciseReviewMenberdata(data: any) {
    if (data && data.exercisesAuditUserList && data.exercisesAuditUserList.length) {
      return data.exercisesAuditUserList.map(e => e.userName).join(',');
    } else {
      return '该用户没有选择习题评审人员';
    }
  }

  getCourseMember(data: any) {
    if (data && data.courseAuditUserList && data.courseMemberUserList.length) {
      return data.courseMemberUserList.map(e => e.userName).join(',');
    } else {
      return '该用户没有选择评审组成员';
    }
  }

  //
  // getPreview(item: any) {
  //   return ToolsUtil.getThumbUrl(item.attachmentPath);
  // }


  tabChage(tab: NzTabChangeEvent) {
    SessionStorageUtil.putKnowledgeGraphTab(JSON.stringify({[this.pid]: tab.index}));
  }

}
