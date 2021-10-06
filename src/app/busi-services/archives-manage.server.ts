import { Injectable } from '@angular/core';
import { HttpService } from 'core/services/http.service';
import { ToolsUtil } from 'core/utils/tools.util';
import { environment } from 'src/environments/environment';
import {ServicesModule} from '@app/service/service.module';
import {
  HttpRequest,
  HttpEvent,
  HttpEventType,
  HttpResponse,
  HttpClient,
} from '@angular/common/http';
const opts = ToolsUtil.getHttpOptions();
@Injectable({
  providedIn: ServicesModule
})

// 指导老师档案
export class ArchivesManageServer {
  constructor(
    private http: HttpService,
    private httpClient: HttpClient,
    ) {
   }
  guideTeacherTableList(param) {
    const url = `pkg/Lecturer/list`;
    return this.http.post(url, param, opts);
  }
  guideTeacherAddEdit(param) {
    const url = `pkg/Lecturer/save`;
    return this.http.postBody(url, param, opts);
  }
  guideTeacherDel(param) {
    const url = `pkg/Lecturer/del`;
    return this.http.get(url, param, opts);
  }
  guideTeacherDetails(param) {
    const url = `pkg/Lecturer/get`;
    return this.http.get(url, param, opts);
  }
  guideTeacherUpdata(param) {
    const url = `pkg/Lecturer/batchSave`;
    return this.http.post(url, param, opts);
  }
  upDataOss(param) {
    const url = environment.OSS_URL;
    const req = new HttpRequest('POST', url, param, {
      reportProgress: true,
    });
    return this.httpClient.request(req);
  }
}
