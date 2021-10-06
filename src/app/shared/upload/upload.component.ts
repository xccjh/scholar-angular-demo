import { Component, OnInit, Input, Output, EventEmitter, Injector } from '@angular/core';
import { NzUploadFile, NzUploadXHRArgs, NzUploadChangeParam } from 'ng-zorro-antd';
import { ImageOpts } from 'core/base/common';
import { HttpService } from 'core/services/http.service';
import { Observable } from 'rxjs';
import { HttpRequest, HttpEvent, HttpEventType, HttpResponse, HttpClient } from '@angular/common/http';
import { ToolsUtil } from 'core/utils/tools.util';
import { environment } from 'src/environments/environment';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'atr-img-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.less']
})
export class UploadComponent implements OnInit {

  @Input() opts: ImageOpts ;

  uploadUrl: '';

  uploadData: any = {};

  showUploadList = {
    showPreviewIcon: true,
    showRemoveIcon: true,
    hidePreviewIconInNonImage: true
  };
  environment = environment;

  @Output()
  afterChange: EventEmitter<any> = new EventEmitter();

  @Output()
  optsChange: EventEmitter<any> = new EventEmitter();

  previewImage: string | undefined = '';
  previewVisible = false;

  constructor(private injector: Injector , private httpClient: HttpClient) {}

  ngOnInit() {

  }
  onChange(params: NzUploadChangeParam) {
    // console.log(params)

    if (params.type === 'success' || params.type === 'removed') {
      this.opts.imageList = params.fileList;

      const fileUrls = [];
      for (const file of params.fileList) {
        if (file['key'] !== undefined) {
          fileUrls.push(file['key']);
          continue;
        }
        if (file.originFileObj && file.originFileObj['key'] !== undefined) {
          fileUrls.push(file.originFileObj['key']);
        }
      }

      this.afterChange.emit({key: this.opts.key, values: fileUrls.join(',')});
      this.optsChange.emit(this.opts);
    }
  }

  private get httpService(): HttpService {
    return this.injector.get(HttpService);
  }

  handlePreview = (file: NzUploadFile) => {
    this.previewImage = file.url || file.thumbUrl;
    this.previewVisible = true;
  }

  remove = (file: NzUploadFile) => {
    // console.log(file);
    if (this.opts && this.opts.removeAction) {
      return false;
    }
    return true;
  }

  beforeUpload = (file: NzUploadFile, fileList: NzUploadFile[]) => {
    return new Observable<boolean>(observe => {
      this.httpService.post('res/oss/getPolicy', {dir: this.opts.uploadDir}, {}).subscribe(
        result => {

          if (result.status === 200) {
            this.uploadData = result.data;
            observe.next(true);
          } else {
            observe.next(false);
          }
          observe.unsubscribe();
        },
        error => {
          observe.next(false);
          observe.unsubscribe();
        }
      );
    });

  }

  customReq = (item: NzUploadXHRArgs) => {
    const formData = new FormData();
    const key = this.uploadData.dir + ToolsUtil.getRandomFileName() + '.' + ToolsUtil.getFileExt(item.file.name);
    formData.append('key', key);
    formData.append('policy', this.uploadData.policy);
    formData.append('OSSAccessKeyId', this.uploadData.accessKeyId);
    formData.append('Signature', this.uploadData.signature);
    formData.append('file', item.file as any);
    formData.append('success_action_status', '200');
    // this.uploadData.host!
    const req = new HttpRequest('POST', environment.OSS_URL, formData, {
      reportProgress: true
    });
    return this.httpClient.request(req).subscribe(
      (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total > 0) {
            (event as any).percent = (event.loaded / event.total) * 100;
          }
          item.onProgress(event, item.file);
        } else if (event instanceof HttpResponse) {
          item.file['key'] = key;
          item.onSuccess(event.body, item.file, event);
        }
      },
      err => {
        item.onError(err, item.file);
      }
    );
  }
}
