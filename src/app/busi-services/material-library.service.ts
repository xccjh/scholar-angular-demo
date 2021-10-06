import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpService} from 'core/services/http.service';
import {ToolsUtil} from 'core/utils/tools.util';
import {ServicesModule} from '@app/service/service.module';

@Injectable({
  providedIn: ServicesModule
})
export class MaterialLibraryService {

  constructor(private httpService: HttpService) {
  }

  resConditionQuery(param): Observable<any> {
    const url = 'res/resource/conditionQuery';
    const options = {isCommonHttpHeader: true, isBody: true};
    return this.httpService.postBody(url, param, options);
  }

  saveSourseware(param: object): Observable<any> {
    const url = 'res/courseware/saveCollegeResource';
    const options = {isCommonHttpHeader: true, isBody: true};
    return this.httpService.post(url, param, options);
  }

  getResourceDetail(id: string, type: string): Observable<any> {
    const url = 'res/resource/resourceDetail';
    return this.httpService.post(url, {id, type}, ToolsUtil.getHttpOptions());
  }

  preDelCheck(id: string) {
    const url = 'res/resource/checkDelPractical/' + id;
    return this.httpService.get(url, {}, ToolsUtil.getHttpOptions());
  }

  getCodeUid() {
    const url = 'sys/org/getOrgForTiku';
    return this.httpService.get(url, {}, ToolsUtil.getHttpOptions());
  }

  // 删除资源
  delResource(id: string): Observable<any> {
    const url = 'res/resource/commonDel/' + id;
    return this.httpService.post(url, {}, ToolsUtil.getHttpOptions());
  }

  // 复制资源
  copyResource(id: string): Observable<any> {
    const url = 'res/courseware/copyCase';
    return this.httpService.postBody(url, {id}, ToolsUtil.getHttpOptions());
  }

  // 保存阅读
  saveCourseware(param: object): Observable<any> {
    const url = 'res/courseware/saveMaterial';
    return this.httpService.postBody(url, param, {isCommonHttpHeader: true});
  }

  // 保存案例
  saveCase(param: object): Observable<any> {
    const url = 'res/courseware/saveCase';
    return this.httpService.postBody(url, param, {isCommonHttpHeader: true});
  }

}
