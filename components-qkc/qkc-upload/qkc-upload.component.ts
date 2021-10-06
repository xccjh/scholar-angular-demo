import {Component, forwardRef, Injector, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {NzUploadChangeParam, NzUploadFile, NzUploadXHRArgs} from 'ng-zorro-antd/upload';
import {NzMessageService} from 'ng-zorro-antd/message';
import {environment} from 'src/environments/environment';
import {isNullOrUndefined} from 'util';
import {AliOssService} from 'core/services/ali-oss.service';
import {HttpService} from 'core/services/http.service';
import {ToolsUtil} from 'core/utils/tools.util';
import {UploadDir} from 'core/utils/uploadDir';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'qkc-upload',
  templateUrl: './qkc-upload.component.html',
  styleUrls: ['./qkc-upload.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QkcUploadComponent),
      multi: true
    },
  ]
})
export class QkcUploadComponent implements OnInit, ControlValueAccessor {

  @Input() acceptType = '';

  @Input() limit = 0;

  @Input() uploadDir = '';

  @Input() materialType = 'case';

  @Input() listType: 'text' | 'picture-card' | 'picture' | '' = 'text';

  @Input() isDrag = false;

  @Input() disabled = false;

  uploadData: any = {};

  imageList: NzUploadFile[] = [];

  showUploadList = {
    showPreviewIcon: true,
    showRemoveIcon: true,
    // hidePreviewIconInNonImage: true
    showDownloadIcon: false
  };

  // showUploadList = true;

  previewPath: string | undefined = '';

  previewVisible = false;

  private onModelChange = (_: any) => { };

  constructor(
    private injector: Injector,
    private httpClient: HttpClient,
    private aliOssService: AliOssService
    ) { }

  ngOnInit() {
  }

  private get httpService(): HttpService {
    return this.injector.get(HttpService);
  }

  private get mesService(): NzMessageService {
    return this.injector.get(NzMessageService);
  }

  writeValue(fileList: { name?: string, path: string }[]): void {
    if (isNullOrUndefined(fileList)) {
      this.imageList = [];
    } else {
      this.imageList = fileList.map(ele => {
        return {
          uid: this.createRandomNum(),
          name: ele.name,
          filename: ele.name ? ele.name : '启课程.jpg',
          path: ele.path,
          url: environment.OSS_URL + ele.path,
          thumbUrl: ToolsUtil.getThumbUrl(ele.path),
          lastModifiedDate: new Date(),
          size: 1000,
          status: 'done',
          type: ''
        } as NzUploadFile;
      });
    }
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

  onChange(params: NzUploadChangeParam) {
    if (params.type === 'success') {
      this.imageList = params.fileList.map(file => {
        if (file.uid === params.file.uid) {
          if (ToolsUtil.isPicture(file.name.toLowerCase())) {
            file.url = !isNullOrUndefined(file.originFileObj) ? environment.OSS_URL + file.originFileObj['key'] : file.path;
          } else {
            file.thumbUrl = this.getFileTyeIcon(file.type, file.name);
            file.url = !isNullOrUndefined(file.originFileObj) ? environment.OSS_URL + file.originFileObj['key'] : file.path;
          }
        }
        return file;
      });

      const data = this.formatNgModel(this.imageList);
      this.onModelChange(data);
    }
  }

  getFileTyeIcon(fileType: string, fileName: string) {
    let thumbUrl = '';
    if (fileType === 'application/msword' ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      thumbUrl = environment.OSS_URL + '/common/doc.png';
    } else if (fileType === 'application/vnd.ms-excel' ||
      fileType === 'application/x-xls' ||
      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      thumbUrl = environment.OSS_URL + '/common/excel.png';
    } else if (fileType === 'application/x-ppt' ||
      fileType === 'application/vnd.ms-powerpoint' ||
      fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      thumbUrl = environment.OSS_URL + '/common/ppt.png';
    } else if (fileType === 'application/pdf') {
      thumbUrl = environment.OSS_URL + '/common/pdf.png';
    }

    if (thumbUrl === '') {
      console.log('找不到type：', fileType, fileName);
      thumbUrl = ToolsUtil.getThumbUrl(fileName);
      if (thumbUrl === '') {
        throw new Error('找不到文件类型icon');
      }
    }

    return thumbUrl;
  }

  handlePreview = (file: NzUploadFile) => {
    this.previewPath = file.url || file.thumbUrl;
    this.previewVisible = true;
  }

  remove = (file: NzUploadFile) => {
    this.imageList = this.imageList.filter(ele => ele.uid !== file.uid);
    const data = this.formatNgModel(this.imageList);
    this.onModelChange(data);
  }

  isPermitUpload(filename: string): boolean {
    const ext = ToolsUtil.getExt(filename);
    return this.acceptType.indexOf(ext) >= 0;
  }

  beforeUpload = (file: NzUploadFile, fileList: NzUploadFile[]) => {
    return new Observable<boolean>(observe => {

      if (!this.isPermitUpload(file.name)) {
        this.mesService.error('请上传正确的文件格式');
        observe.next(false);
        return;
      }

      if (this.imageList.length >= this.limit) {
        this.mesService.error('资源只能上传一个，请删除再上传!');
        observe.next(false);
        return;
      }
      const fileType = ToolsUtil.getFileType(file.name);
      let maxSize = 20;

      if ( fileType === 'video' ) {
        maxSize = 200;
      }

      if ( fileType === 'ppt' || fileType === 'pptx' ) {
        maxSize = 500;
      }

      const isLt2M = file.size / 1024 / 1024 < maxSize;

      if (!isLt2M) {
        this.mesService.error('文件大小超出限制，请重新上传');
        observe.next(false);
        return;
      }

      let uploadDir = '';
      if (this.materialType === 'other') {
        uploadDir = fileType === 'video' ? UploadDir.courseware_video : UploadDir.courseware_doc;
      } else {
        if (fileType === 'video') {
          uploadDir = UploadDir.courseware_video;
        } else if (fileType === 'audio') {
          uploadDir = UploadDir.courseware_case_audio;
        } else if (fileType === 'pdf' || fileType === 'word' || fileType === 'ppt' || fileType === 'excel' ) {
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

  customReq = (uploadXhrArgs: NzUploadXHRArgs) => {
    // @ts-ignore
    return this.aliOssService.upload2AliOSS(uploadXhrArgs, this.uploadDir);
  }

  formatNgModel(uploadFileArr: NzUploadFile[]) {
    return uploadFileArr.map(ele => {
      return { name: ele.name, path: !isNullOrUndefined(ele.originFileObj) ? ele.originFileObj['key'] : ele.path };
    });
  }

}
