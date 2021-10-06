import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
// import { UploadFile, UploadXHRArgs } from 'ng-zorro-antd';
import { Observable } from 'rxjs';
import { ToolsUtil } from '../utils/tools.util';
import { HttpRequest, HttpClient, HttpEvent, HttpResponse, HttpEventType } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {ServicesModule} from '@app/service/service.module';

@Injectable({
  providedIn: ServicesModule
})
export class UploadOssService {
  uploadData: any;
  constructor(private httpService: HttpService, private httpClient: HttpClient) { }

  uploadOss = (file, uploadDir) => {
    return new Observable<any>(observe => {
      const success = result => {
        if (result.status === 200) {
          this.uploadData = result.data;
          this.customReq(file).subscribe((url) => {
            observe.next(url);
            observe.unsubscribe();
          });

        } else {
          observe.next(false);
          observe.unsubscribe();
        }
      };

      const error = err => {
        observe.next(false);
        observe.unsubscribe();
      };

      this.httpService.post('res/oss/getPolicy', { dir: uploadDir }, {}).subscribe(success, error);
    });

  }

  customReq = (file) => {
    const formData = new FormData();
    const key = this.uploadData.dir + ToolsUtil.getRandomFileName() + '.' + ToolsUtil.getFileExt(file.name);
    formData.append('OSSAccessKeyId', this.uploadData.accessKeyId);
    formData.append('policy', this.uploadData.policy);
    formData.append('Signature', this.uploadData.signature);
    formData.append('key', key);
    formData.append('success_action_status', '200');
    formData.append('file', file as any);
    // this.uploadData.host!
    const req = new HttpRequest('POST', environment.OSS_URL, formData, {
      reportProgress: true
    });

    return new Observable<any>(observe => {
      const success = (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {

        } else if (event instanceof HttpResponse) {
          // const url = event.url + key;
          observe.next(`/${key}`);
          observe.unsubscribe();
        }
      };

      const error = () => {
        observe.next(false);
        observe.unsubscribe();
      };

      this.httpClient.request(req).subscribe(success, error);
    });
  }
}
