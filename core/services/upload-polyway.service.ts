import {Injectable} from '@angular/core';
import {HttpService} from './http.service';
import {HttpRequest, HttpClient, HttpEvent, HttpResponse, HttpEventType} from '@angular/common/http';
import {environment} from 'src/environments/environment';
import {NzMessageService} from 'ng-zorro-antd/message';
import {hex_sha1} from '../utils/sha1';
import {ServicesModule} from '@app/service/service.module';

@Injectable({
  providedIn: ServicesModule
})
export class UploadPolywayService {

  percent = 0;
  percentReport: (percent: number) => void;

  constructor(private httpService: HttpService, private httpClient: HttpClient, private nzMsg: NzMessageService) {
  }

  uploadPolyway = (file) => {
    return this.customReq(file);
  }

  customReq = (uploadXhrArgs) => {
    const that = this;
    this.percentReport = uploadXhrArgs.percentReport;
    const formData = new FormData();
    const JSONRPC = JSON.stringify({
      title: uploadXhrArgs.file.name,
      tag: uploadXhrArgs.file.name,
      desc: uploadXhrArgs.file.name
    });
    formData.append('JSONRPC', JSONRPC);
    formData.append('Filedata', uploadXhrArgs.file);
    formData.append('writetoken', environment.writetoken);
    formData.append('cataid', environment.cataid);
    formData.append('fcharset', 'ISO-8859-1');
    const sign = hex_sha1(`cataid=${environment.cataid}&JSONRPC=${JSONRPC}&writetoken=${environment.writetoken}${environment.secretkey}`)
      .toUpperCase();
    formData.append('sign', sign);
    // this.uploadData.host!
    const req = new HttpRequest('POST', environment.polywayUpload + 'uc/services/rest/?method=uploadfile', formData, {
      reportProgress: true
    });
    return this.httpService.originalHttpClient.request(req).subscribe(
      (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total > 0) {
            Object.defineProperty(event, 'percent', {
              configurable: true,
              get() {
                return that.percent;
              },
              set(val) {
                if (that.percentReport) {
                  that.percentReport(val);
                }
                that.percent = val;
              },
            });
            (event as any).percent = (event.loaded / event.total) * 100;
          }
          uploadXhrArgs.onProgress(
            event,
            uploadXhrArgs.file
          );
        } else if (event instanceof HttpResponse) {
          if (event.body.error === '0') {
            uploadXhrArgs.onSuccess(
              event.body,
              uploadXhrArgs.file,
              event
            );
          } else {
            uploadXhrArgs.onError(
              '错误码' + event.body.error,
              uploadXhrArgs.file,
            );
            this.nzMsg.warning('上传错误，保利威错误码' + event.body.error);
          }
        }
      },
      (err) => {
        uploadXhrArgs.onError(err, uploadXhrArgs.file);
      }
    );
  }
}
