import {Component, Inject, Input, LOCALE_ID, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {ActivatedRoute} from '@angular/router';
import {MenuService} from 'core/services/menu.service';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {AliOssService} from 'core/services/ali-oss.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {KnowledgeManageService} from 'src/app/busi-services/knowledge-manag.service';
import {ToolsUtil} from 'core/utils/tools.util';
import {NzUploadXHRArgs} from 'ng-zorro-antd';
import {TrainManageService} from '@app/busi-services/train-manage.service';
import {WINDOW} from '@app/service/service.module';
import {DomSanitizer} from '@angular/platform-browser';
import {UploadDir} from 'core/utils/uploadDir';
import {UploadOssService} from 'core/services/upload-oss.service';
import {HttpResponse} from '@angular/common/http';
import {NzUploadFile} from 'ng-zorro-antd/upload/interface';


@Component({
  selector: 'app-video-import',
  templateUrl: './video-import.component.html',
  styleUrls: ['./video-import.component.less'],
})
export class VideoImportComponent implements OnInit , OnDestroy {

  videoImportForm: FormGroup;
  videoImportLoading = false;
  loading = false;
  nzFileList: NzUploadFile[] = [];
  @Input() courseId: string;
  // @Input() afterOpen: EventEmitter<void>;
  @Input() coursePacketId: string;


  constructor(
    private route: ActivatedRoute,
    private menuService: MenuService,
    private nzMesService: NzMessageService,
    private courseMgService: CourseManageService,
    private nzModalService: NzModalService,
    private nzModalRef: NzModalRef,
    private aliOssService: AliOssService,
    private fb: FormBuilder,
    private modalService: NzModalService,
    private knowledgeManageService: KnowledgeManageService,
    private renderer2: Renderer2,
    private trainManageService: TrainManageService,
    private sanitizer: DomSanitizer,
    private uploadOssService: UploadOssService,
    @Inject(LOCALE_ID) public locale: string,
    @Inject(WINDOW) public win: any,
  ) {

  }

  ngOnInit() {
    this.videoImportForm = this.fb.group({
      videoUrl: ['', Validators.required]
    });

  }

  ngOnDestroy() {
  }


  // 自定义删除
  removeFileSelf = () => {
    this.videoImportForm.patchValue({
      videoUrl: '',
    });
    this.nzFileList = [];
  }


  // 上传excel校验
  beforeVideoUpload = (file: any) => {
    const type = ToolsUtil.getFileType(file.name);
    if (type === 'excel') {
      return true;
    } else {
      this.nzMesService.error('请上传excel,支持后缀xls, xlsx');
    }
  }

  // 上传视频
  customVideoRequest = (item: NzUploadXHRArgs) => {
    this.loading = true;
    this.uploadOssService
      .uploadOss(item.file, UploadDir.knowledge_file)
      .subscribe((result) => {
        this.loading = false;
        this.videoImportForm.patchValue({
          videoUrl: result,
        });
        item.onSuccess({...item}, item.file, {});
      }, (err) => {
        this.loading = false;
        item.onError(err, item.file);
        this.nzMesService.error(JSON.stringify(err));
      });
  }


  // 录播下载excel模板
  downTemplate() {
    this.courseMgService.exportExcelVideo().subscribe((resp: HttpResponse<Blob>) => {
        // const headers: HttpHeaders = resp.headers;
        // (window as any).aa=headers.get('content-disposition').split('=')[1];
        // console.log(headers.get('content-disposition').split('=')[1]);
        const link = document.createElement('a');
        // 支持HTML5下载属性的浏览器
        const url = URL.createObjectURL(resp.body);
        link.setAttribute('href', url);
        link.setAttribute('download', '导入视频模板');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      error => this.nzMesService.error(error));
  }

  save() {
    if (!this.videoImportForm.value.videoUrl) {
      this.nzMesService.warning('请先上传文件');
      return;
    }
    this.videoImportLoading = true;
    const params = {
      courseId: this.courseId,
      coursePacketId: this.coursePacketId,
      fileUrl: this.videoImportForm.value.videoUrl
    };
    this.courseMgService.excelImportVideo(params).subscribe(res => {
      this.videoImportLoading = false;
      if (res.status === 200) {
        this.nzMesService.success('导入成功');
        this.nzModalRef.close(true);
      } else {
        if (res.status === 500) {
          this.nzMesService.warning(res.message);
        }
      }
    }, () => {
      this.videoImportLoading = false;
    });
  }

  cancel() {
    this.nzModalRef.close(false);
  }
}

