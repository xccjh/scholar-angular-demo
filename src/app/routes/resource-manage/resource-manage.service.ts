import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'core/services/http.service';
import { ToolsUtil } from 'core/utils/tools.util';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ResourceManageService {

  constructor(private httpService: HttpService) { }

  resConditionQuery(param: { page: number, limit: number }): Observable<any> { // 资源列表
    const url = 'res/resource/conditionQuery';
    const options = { isCommonHttpHeader: true };
    return this.httpService.post(url, param, options);
  }

  // getKnowledgeTree(param: { id: string }): Observable<any> { // 获取学科树
  //   const url = 'pkg/major/listMajor';
  //   return this.httpService.post(url, param, ToolsUtil.getHttpOptions());
  // }

  addExercise(param: any): Observable<any> { // 保存题目
    const url = 'res/question/save';
    return this.httpService.post(url, param, ToolsUtil.getHttpOptions());
  }

  getExercisesDetail(param: { id: string }): Observable<any> { // 获取题目详情
    const url = 'res/question/get';
    const options = { isCommonHttpHeader: true };
    return this.httpService.post(url, param, options);
  }

  getExercisesDetailInOss(url: string): Observable<any> { // 从oss获取题目详情
    const ossUrl = `${environment.OSS_URL}${url}`;
    // const options = { isCommonHttpHeader: true };
    return this.httpService.get(ossUrl, {}, {});
  }

  changeStatus(param: { id: string, status: any }): Observable<any> { // 修改状态
    const url = 'res/question/del';
    const options = { isCommonHttpHeader: true };
    return this.httpService.post(url, param, options);
  }

  saveCourseSectionResource(param: any): Observable<any> { // 调用
    const url = 'pkg/courseSectionResource/save';
    const options = { isCommonHttpHeader: true };
    return this.httpService.post(url, param, options);
  }
}
