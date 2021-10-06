import {Component, EventEmitter, Input, OnInit, TemplateRef, ViewChild, OnDestroy} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {ActivatedRoute} from '@angular/router';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {StructureAdjustmentSectionComponent} from './structure-adjustment-section/structure-adjustment-section.component';
import {StructureAdjustmentChapterComponent} from './structure-adjustment-chapter/structure-adjustment-chapter.component';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ToolsUtil} from 'core/utils/tools.util';
import {Observable} from 'rxjs';
import {UploadXHRArgs} from 'ng-zorro-antd';
import {UploadDir} from 'core/utils/uploadDir';
import {UploadOssService} from 'core/services/upload-oss.service';
import {environment} from '../../../../../environments/environment';
import {HttpHeaders, HttpResponse} from '@angular/common/http';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {ConfirmableFlat} from '../../../../../../core/decorators';
import {LoadingControl} from '../../../../../../core/base/common';

@Component({
  selector: 'app-structure-adjustment',
  templateUrl: './structure-adjustment.component.html',
  styleUrls: ['./structure-adjustment.component.less']
})
export class StructureAdjustmentComponent implements OnInit, OnDestroy {
  courseId = '';
  coursePacketId = '';
  packageName = '';
  isStandard = false;
  preview = '0';
  nodes = [];
  curChapter: any;
  isVisible = false;
  fileList = [];
  localUploadChapter: FormGroup;
  loading = false;
  modalFormRef: NzModalRef;
  afterOpen = new EventEmitter<void>();
  downTemplateLoading = false;
  knowledgeGraphLoading = false;
  chapterExportLoading = false;
  @ViewChild('localuploadmodal') localuploadmodal: TemplateRef<any>;
  @ViewChild('qkcupload') qkcupload;


  constructor(
    private route: ActivatedRoute,
    private courseMgService: CourseManageService,
    private nzMesService: NzMessageService,
    private nzModalService: NzModalService,
    private uploadOssService: UploadOssService,
    private fb: FormBuilder,
    private modalService: NzModalService,
  ) {
  }

  ngOnInit() {
    this.initParams();
    this.afterOpen.subscribe(res => {
      this.localUploadChapter.patchValue({
        chapterUrl: '',
      });
      this.qkcupload.nzFileList = [];
    });
  }


  ngOnDestroy() {
    this.afterOpen.unsubscribe();
  }

  initParams() {
    const {courseId, id, status, preview, isUsed ,name} = SessionStorageUtil.getPacketInfo();
    this.courseId = courseId;
    this.coursePacketId = id;
    this.packageName = name;
    this.isStandard = isUsed > 0;
    this.preview = preview;
    this.getChapter();
    this.localUploadChapter = this.fb.group({
      chapterUrl: [''],
    });
  }

  checkStructure(): boolean {
    if (this.nodes.length === 0) {
      return false;
    }
    for (const chapter of this.nodes) {
      if (chapter.children && chapter.children.length === 0) {
        return false;
      }
    }
    return true;
  }


  getChapter(): void {
    this.courseMgService.getList_courseChapter(this.coursePacketId).subscribe(res => {
      if (res.status === 200) {
        (res.data as any[]).forEach(data => {
          data.active = false;
        });
        this.nodes = res.data;
        if (this.nodes.length > 0) {
          this.nodes[0].active = true;
          this.sectionChange(this.nodes[0]);
        }
      }
    });
  }

  getSection(node: any): void {
    this.courseMgService.getList_courseSection(node.id).subscribe(res => {
      if (res.status === 200) {
        node.children = res.data;
      } else {
        node.isLoading = false;
      }
    });
  }

  sectionChange(chapter: any) {
    this.setChapter(chapter);
    if (!chapter.children || chapter.children.length === 0) {
      this.getSection(chapter);
    }
  }

  setChapter(chapter: any) {
    this.curChapter = chapter;
  }

  addChapter(chapter: any) {
    const isRename = chapter ? true : false;
    const title = isRename ? '重命名章' : '新增章';
    const param = {
      nzTitle: title,
      nzContent: StructureAdjustmentChapterComponent,
      nzComponentParams: {
        courseId: this.courseId,
        coursePacketId: this.coursePacketId,
        data: this.nodes,
        formData: chapter
      },
      nzMaskClosable: false,
      nzFooter: null
    };
    const modalRef = this.nzModalService.create<StructureAdjustmentChapterComponent, any>(param);
    modalRef.afterClose.subscribe(res => {
      if (!res) {
        return;
      }
      if (isRename) {
        const {name} = res;
        chapter.name = name;
      } else {
        if (!res.active) {
          res.active = true;
        }
        const chapterIdx = this.nodes.findIndex(chapterItem => chapterItem.id === res.id);
        const startIdx = chapterIdx === -1 ? this.nodes.length : chapterIdx;
        const delCount = chapterIdx === -1 ? 0 : 1;
        this.nodes.splice(startIdx, delCount, res);
      }
    });
  }

  addSection(node: any, section: any) {
    this.setChapter(node);
    const title = section ? '重命名节' : '新增节';
    const modalRef = this.nzModalService.create<StructureAdjustmentSectionComponent, any>({
      nzTitle: title,
      nzContent: StructureAdjustmentSectionComponent,
      nzComponentParams: {
        courseId: this.courseId,
        coursePacketId: this.coursePacketId,
        data: node,
        formData: section
      },
      nzMaskClosable: false,
      nzFooter: null
    });
    modalRef.afterClose.subscribe(res => {
      if (!res) {
        return;
      }
      this.getSection(this.curChapter);
    });
  }

  delSection(node: any, section: any) {
    this.setChapter(node);
    this.nzModalService.confirm({
      nzTitle: '警告',
      nzContent: `确定要删除${section.name}吗`,
      nzOnOk: () => {
        return new Promise((resolve, reject) => {
          this.courseMgService.delTreeNode(section.id, 'section').subscribe(res => {
            if (res.status !== 204) {
              this.nzMesService.error(res.message);
              resolve(false);
              return;
            }
            const sectionIdx = node.children.findIndex(sectionItem => sectionItem.id === section.id);
            node.children.splice(sectionIdx, 1);
            const params = {
              courseId: this.courseId,
              coursePacketId: this.coursePacketId,
              chapters: [
                {
                  id: this.curChapter.id,
                  seq: this.curChapter.seq,
                  sections: node.children.map((item, index) => ({
                    id: item.id,
                    seq: index + 1
                  }))
                }
              ]
            };
            this.sort(params);
            resolve(true);
          });
        });
      }
    });
  }

  delChapter(chapter: any) {
    this.nzModalService.confirm({
      nzTitle: '警告',
      nzContent: `确定要删除${chapter.name}吗`,
      nzOnOk: () => {
        return new Promise((resolve, reject) => {
          this.courseMgService.delTreeNode(chapter.id, 'chapter').subscribe(res => {
            if (res.status !== 204) {
              this.nzMesService.error(res.message);
              resolve(false);
              return;
            }
            const chapterIdx = this.nodes.findIndex(chapterItem => chapterItem.id === chapter.id);
            this.nodes.splice(chapterIdx, 1);
            const params = {
              courseId: this.courseId,
              coursePacketId: this.coursePacketId,
              chapters: this.nodes.map((item, index) => ({
                id: item.id,
                seq: index + 1
              }))
            };
            this.sort(params);
            resolve(true);
          });
        });
      }
    });
  }

  sort(params: any) {
    const successFn = (res: any) => {
      if (res.status !== 200) {
        this.nzMesService.error(res.message || '移动失败，未知错误！');
        return;
      }
    };
    const failFn = (error: any) => {
      this.nzMesService.error(JSON.stringify(error));
    };
    this.courseMgService.save_courseChapter(params).subscribe(successFn, failFn);
  }

  chapterDrop(event: CdkDragDrop<any[]>) {
    if ((!this.isStandard) && this.preview === '0') {
      const chapters: any[] = this.nodes || [];
      moveItemInArray(chapters, event.previousIndex, event.currentIndex);
      const params = {
        courseId: this.courseId,
        coursePacketId: this.coursePacketId,
        chapters: chapters.map((chapter, index) => ({
          id: chapter.id,
          seq: index + 1
        }))
      };
      this.sort(params);
    }
  }

  sectionDrop(event: CdkDragDrop<any[]>) {
    const sections: any[] = this.curChapter.children || [];
    moveItemInArray(sections, event.previousIndex, event.currentIndex);
    const params = {
      courseId: this.courseId,
      coursePacketId: this.coursePacketId,
      chapters: [
        {
          id: this.curChapter.id,
          seq: this.curChapter.seq,
          sections: sections.map((section, index) => ({
            id: section.id,
            seq: index + 1
          }))
        }
      ]
    };
    this.sort(params);
  }

  chapterImport() {
    this.modalFormRef = this.modalService.create({
      nzTitle: 'excel导入章节',
      nzContent: this.localuploadmodal,
      nzMaskClosable: false,
      nzWrapClassName: 'vertical-center-modal',
      nzCancelText: '取消',
      nzOkText: '确定上传',
      nzAfterOpen: this.afterOpen,
      nzOnOk: (e) => {
        return new Promise((resolve, reject) => {
          if (!this.localUploadChapter.value.chapterUrl) {
            this.nzMesService.warning('请先上传文件');
            resolve(false);
            return;
          }
          const params = {
            courseId: this.courseId,
            coursePacketId: this.coursePacketId,
            fileUrl: this.localUploadChapter.value.chapterUrl
          };
          this.courseMgService.excelImportChapter(params).subscribe(res => {
            if (res.status === 200) {
              this.getChapter();
              resolve(true);
            } else {
              if (res.status === 500) {
                this.nzMesService.warning(res.message);
              }
              resolve(false);
            }
          }, err => {
            resolve(false);
          });
        });
      }
    });
  }

  chapterExport() {
      this.chapterExportLoading = true;
      this.courseMgService.packetChapterExport(this.coursePacketId).subscribe(resp => {
        this.chapterExportLoading =  false;
        const link = document.createElement('a');
        // 支持HTML5下载属性的浏览器
        const url = URL.createObjectURL(resp.body);
        link.setAttribute('href', url);
        link.setAttribute('download', this.packageName + '章节结构.xls');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, () => {
        this.chapterExportLoading = false;
      });
  }

  @ConfirmableFlat({
    title: '导入知识图谱',
    content: '您确定将知识图谱中的章节结构一键同步到课包结构吗？将会清除已有的章节结构。',
    type: 'warning'
  })
  knowledgeGraph(loadingControl?: LoadingControl) {
    return new Promise((resolve) => {
      this.knowledgeGraphLoading = loadingControl.loading = true;
      this.courseMgService.synchronizedKnowledge({
        courseId: this.courseId,
        coursePacketId: this.coursePacketId
      }).subscribe(res => {
        this.knowledgeGraphLoading = loadingControl.loading = false;
        if (res.status === 201) {
          this.getChapter();
          resolve(true);
        } else {
          resolve(false);
        }
      }, () => {
        this.knowledgeGraphLoading = loadingControl.loading = false;
        resolve(false);
      });
    });

  }

  customChapterRequest() {
    const thisObj = this;
    return (item: UploadXHRArgs) => {
      this.loading = true;
      const success = (result) => {
        this.loading = false;
        this.localUploadChapter.patchValue({
          chapterUrl: result,
        });
        item.onSuccess({...item}, item.file, {});
      };
      const fail = (err) => {
        this.loading = false;
        item.onError(err, item.file);
        thisObj.nzMesService.error(JSON.stringify(err));
      };
      thisObj.uploadOssService
        .uploadOss(item.file, UploadDir.knowledge_file)
        .subscribe(success, fail);
    };
  }

  beforeChapterUpload() {
    const thisObj = this;
    return (file: any) => {
      const type = ToolsUtil.getFileType(file.name);
      if (type !== 'excel') {
        thisObj.nzMesService.error('请上传excel,支持后缀xls, xlsx');
        return false;
      } else {
        return new Observable<boolean>((observe) => {
          observe.next(true);
        });
      }
    };
  }

  removeFileSelf() {
    const that = this;
    const func = function() {
      that.localUploadChapter.patchValue({
        chapterUrl: '',
      });
      this.nzFileList = [];
    };
    return func;
  }

  downTemplate() {
    this.downTemplateLoading = true;
    this.courseMgService.exportExcel().subscribe((resp: HttpResponse<Blob>) => {
        const headers: HttpHeaders = resp.headers;
        // (window as any).aa=headers.get('content-disposition').split('=')[1];
        // console.log(headers.get('content-disposition').split('=')[1]);
        const link = document.createElement('a');
        // 支持HTML5下载属性的浏览器
        const url = URL.createObjectURL(resp.body);
        link.setAttribute('href', url);
        link.setAttribute('download', '章节结构模板');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.downTemplateLoading = false;
      },
      error => {
        this.nzMesService.error(JSON.stringify(error));
        this.downTemplateLoading = false;
      }
    );
    // window.location.href = this.ossUrl + '/template/scholar/课包章节导入模板.xls';
  }
}
