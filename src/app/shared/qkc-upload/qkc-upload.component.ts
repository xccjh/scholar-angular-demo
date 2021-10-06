import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  forwardRef, TemplateRef, ContentChild,
} from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';
import {Observable, timer} from 'rxjs';
import {
  NzUploadFile,
  NzUploadXHRArgs,
  NzUploadChangeParam,
  NzMessageService,
} from 'ng-zorro-antd';
import {ToolsUtil} from 'core/utils/tools.util';
import {UploadDir} from 'core/utils/uploadDir';
import {getFileThumbUrl} from 'core/utils/common';
import {AliOssService} from 'core/services/ali-oss.service';
import {UploadPolywayService} from 'core/services/upload-polyway.service';
import {NzUploadXHRArgsExtend} from 'core/base/common';
import {DomSanitizer} from '@angular/platform-browser';
import {environment} from '../../../environments/environment';

declare const polyvObject: any;

@Component({
  selector: 'qkc-upload',
  templateUrl: './qkc-upload.component.html',
  styleUrls: ['./qkc-upload.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QkcUploadComponent),
      multi: true,
    },
  ],
})
export class QkcUploadComponent implements OnInit, ControlValueAccessor {
  @Input() acceptType = '';
  @Input() isPolyway = false;
  @Input() limit = 0;
  @Input() uploadDir = '';
  @Input() materialType = 'case';
  @Input() multiple = false;
  @Input() listType: 'text' | 'picture-card' | 'picture' | '' = 'text';
  @Input() isDrag = false;
  @Input() type: '' | 'other-add' | 'other-edit' = '';
  @Input() checkCustomize;
  @Input() maxSize;
  @Input() showUploadList: any = {
    showPreviewIcon: true,
    showRemoveIcon: true,
    showDownloadIcon: false,
  };
  @Output()
  afterChange: EventEmitter<any> = new EventEmitter();
  @Output()
  percentReport: EventEmitter<any> = new EventEmitter();
  @Output()
  optsChange: EventEmitter<any> = new EventEmitter();
  @Output()
  removeFile: EventEmitter<any> = new EventEmitter();
  previewPath = '';
  resourceUrl;
  imageList: NzUploadFile[] = [];
  isPreviewpolyway = false;
  previewStart = false;
  previewTitle = '';
  previewVisible = false;
  cancel = true;
  ossUrl = environment.OSS_URL;
  private onModelChange = (_: any) => {
  };

  constructor(
    private nzMsg: NzMessageService,
    private aliOssService: AliOssService,
    private uploadPolywayService: UploadPolywayService,
    private sanitizer: DomSanitizer,
  ) {
  }

  ngOnInit() {
    if (this.type === 'other-add') {
      this.showUploadList = false;
    }
  }

  writeValue(fileList: { name: string; path: string; title?: string; seq?: number }[]): void {
    if (!fileList || !fileList.length) {
      this.imageList = [];
      return;
    }
    this.imageList = fileList.map((file) => {
      return {
        ...file,
        uid: this.createRandomNum(),
        name: file.name,
        filename: file.name,
        path: file.path,
        url: ToolsUtil.getOssUrl(file.path),
        thumbUrl: ToolsUtil.getThumbUrl(file.path),
        title: file.title,
        lastModifiedDate: new Date(),
        size: 1000,
        status: 'done',
        type: '',
      } as NzUploadFile;
    });
  }

  registerOnChange(fn: any): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState?(isDisabled: boolean): void {
  }

  createRandomNum(): string {
    return `qkc${new Date().getTime()}${Math.random() * 1000 + 1}`;
  }

  previewpolyway(polywayId) {
    this.isPreviewpolyway = true;
    this.resourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl
    (environment.ow365.substr(0, environment.ow365.length - 5) + 'polywayId=' + polywayId);
  }


  onChange(params: NzUploadChangeParam) {
    if (params.type === 'success') {
      this.imageList = params.fileList.map((file, ii) => {
        if (file.uid === params.file.uid) {
          const ext = ToolsUtil.getExt(file.name.toLowerCase());
          if (ToolsUtil.isPicture(ext)) {
            file.url = file.originFileObj
              ? file.originFileObj['url']
              : file.path;
          } else if (!ToolsUtil.isMP3(ext)) {
            file.thumbUrl = this.getFileTyeIcon(file.type, file.name);
            file.url = file.originFileObj
              ? file.originFileObj['url']
              : file.path;
          }
        }
        if (!file.title) {
          file.title = file.name.substr(0, 30);
        }
        return file;
      });
      const data = this.formatNgModel(this.imageList);
      this.onModelChange(data);
      this.optsChange.emit(params.file);
    } else {
      this.afterChange.emit(params);
    }
  }

  getFileTyeIcon(fileType: string, fileName: string) {
    let thumbUrl = getFileThumbUrl(fileType);
    if (thumbUrl === '') {
      thumbUrl = ToolsUtil.getThumbUrl(fileName);
    }
    return thumbUrl;
  }


  handlePreview = (file: NzUploadFile) => {
    // if (this.isPolyway) {
    //   this.previewpolyway(file.response.data[0].vid);
    // } else {
    //   this.previewPath = file.url || file.thumbUrl;
    // }
    // this.previewVisible = true;
    if (this.isPolyway) {
      this.isPreviewpolyway = true;
      this.resourceUrl = file.response.data[0].vid;
      this.previewTitle = '';
      this.previewStart = true;
    } else {
      this.isPreviewpolyway = false;
      this.previewTitle = file.name || '资料预览';
      this.resourceUrl = environment.ow365 + (file.url || file.thumbUrl);
      this.previewStart = true;
    }
  };


  closePreview() {
    this.isPreviewpolyway = false;
    this.resourceUrl = '';
    this.previewTitle = '';
    this.previewStart = false;
  }

  remove = (file: NzUploadFile) => {
    this.imageList = this.imageList.filter((ele) => ele.uid !== file.uid);
    const data = this.formatNgModel(this.imageList);
    this.onModelChange(data);
    this.removeFile.emit(file);
    this.cancel = false;
    timer(0).subscribe(() => {
      this.cancel = true;
    });
  };

  isPermitUpload(filename: string): boolean {
    const ext = ToolsUtil.getExt(filename);
    return this.acceptType.indexOf(ext) >= 0;
  }

  beforeUpload = (file: NzUploadFile, fileList: NzUploadFile[]) => {
    return new Observable<boolean>((observe) => {
      if (this.checkCustomize) {
        if (!this.checkCustomize()) {
          observe.next(false);
          return;
        }
      }

      if (!this.isPermitUpload(file.name)) {
        this.nzMsg.error('请上传正确的文件格式');
        observe.next(false);
        return;
      }

      if (!this.checkName(file.name)) {
        this.nzMsg.error('请不要重复上传，文件名重复');
        observe.next(false);
        return;
      }

      if (file.name.length > 100) {
        this.nzMsg.error(file.name + '名称太长，文件名包含扩展名请保持100个字符以内');
        observe.next(false);
        return;
      }

      if (this.type === 'other-edit') {
        if (this.imageList.length >= this.limit) {
          this.nzMsg.error('资源只能上传一个，请删除再上传!');
          observe.next(false);
          return;
        }
      }

      const fileType = ToolsUtil.getFileType(file.name);
      // let maxSize = 200;

      // if (fileType === 'video') {
      //   maxSize = 1024 * 5;
      // }

      // if (fileType === 'ppt' || fileType === 'pptx') {
      //   maxSize = 500;
      // }

      if (this.maxSize && (fileType === 'excel' || fileType === 'word' || fileType === 'pdf' || fileType === 'ppt') ) {
        const isLt2M = file.size / 1024 / 1024 < this.maxSize;
        if (!isLt2M) {
          this.nzMsg.error('文件大小超出' + this.maxSize + 'M，请重新上传');
          observe.next(false);
          return;
        }
      }


      let uploadDir = '';
      if (this.materialType === 'other') {
        uploadDir =
          fileType === 'video'
            ? UploadDir.courseware_video
            : UploadDir.courseware_doc;
      } else {
        if (fileType === 'video') {
          uploadDir = UploadDir.courseware_video;
        } else if (fileType === 'audio') {
          uploadDir = UploadDir.courseware_case_audio;
        } else if (
          fileType === 'pdf' ||
          fileType === 'word' ||
          fileType === 'ppt' ||
          fileType === 'excel'
        ) {
          uploadDir = UploadDir.courseware_case_doc;
        } else {
          uploadDir = UploadDir.courseware_case_static;
        }
      }
      this.uploadDir = uploadDir;

      observe.next(true);
      observe.complete();
    });
  }


  customReq = (uploadXhrArgs: any) => {
    this.extendCallBack(uploadXhrArgs);
    if (this.isPolyway) {
      return this.uploadPolywayService.uploadPolyway(uploadXhrArgs);
    } else {
      return this.aliOssService.upload2AliOSS(uploadXhrArgs, this.uploadDir);
    }
  }

  formatNgModel(uploadFileArr: NzUploadFile[]) {
    return uploadFileArr.map((ele: any, ii) => {
      const obj: any = {
        name: ele.name,
        title: ele.title,
        seq: ii
      };
      if (this.isPolyway) {
        // obj.path = ele.response.data[0].mp4;
        obj.path = ele.response.data[0].vid;
        obj.videoLength = ele.response.data[0].duration;
      } else {
        obj.path = ele.originFileObj ? ele.originFileObj.key : ele.path;
      }
      return obj;
    });
  }

  private extendCallBack(uploadXhrArgs: NzUploadXHRArgsExtend) {
    uploadXhrArgs.percentReport = (percent) => {
      if (this.percentReport) {
        this.percentReport.emit(percent);
      }
    };
  }

  titleChange(title: string) {
    const data = this.formatNgModel(this.imageList);
    this.onModelChange(data);
  }


  private checkName(name: string) {
    return this.imageList.every((file) => {
      if (file.name !== name) {
        return true;
      }
    });
  }
}
