import {Injectable} from '@angular/core';
import {HttpService} from 'core/services/http.service';
import {Observable} from 'rxjs';
import {ServicesModule} from '@app/service/service.module';
import {
  CommonPagination,
  DisciplineDataType,
  ProfessionalParams
} from 'core/base/common';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: ServicesModule
})
export class KnowledgeManageService {

  constructor(private http: HttpService) {
  }

  delMajor(params) {
    const url = 'pkg/major/del';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, params, options);
  }

  queryProgress(knowledgeSubjectId) {
    const url = 'res/knowledge-point/checkImportProgress/' + knowledgeSubjectId;
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, {}, options);
  }

  getExerciseReview() {
    const url = 'sys/org/listSchoolsAndTeachers';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, {}, options);
  }

  nailingApproval(param) {
    const url = 'pkg/course/approval';
    const options = {isCommonHttpHeader: true};
    return this.http.post(url, param, options);
  }


  delBind(id) {
    const url = 'pkg/courseTaskLink/del';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, {id}, options);
  }

  getTaskList(params) {
    const url = 'pkg/courseTask/getList';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, params, options);
  }

  getDetailApprove(knowledgeSubjectId) {
    const url = `res/knowledge-point/countPreAudit/${knowledgeSubjectId}`;
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, {}, options);
  }

  exportExcel(id): Observable<any> {
    const url = 'res/knowledge-point/exportExcel/' + id;
    const options = {isCommonHttpHeader: true, isFile: true, isObserve: true};
    return this.http.get(url, {}, options);
  }

  detailKnowledge(params) {
    const url = 'res/knowledge-point/get/' + params.id;
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, {}, options);
  }

  importKnowledge(id, excelUrl) {
    const url = 'res/knowledge-point/importExcel/' + id;
    const options = {isCommonHttpHeader: true};
    return this.http.postBody(url, {fileUrl: excelUrl}, options);
  }

  getTeacher() {
    const url = 'pkg/Lecturer/queryList';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, {}, options);
  }

  approveAll(params) {
    const url = 'pkg/course/courseProcess';
    const options = {isCommonHttpHeader: true};
    return this.http.post(url, params, options);
  }

  // 学科搜索
  searchMajor(params: ProfessionalParams): Observable<CommonPagination<DisciplineDataType>> {
    const url = 'pkg/major/listMajor';
    const options = {isCommonHttpHeader: true};
    return this.http.post(url, params, options).pipe(map((res: CommonPagination<DisciplineDataType>) => res));
  }

  // 负责人查询
  getChargeList(params = {}) {
    const url = 'sys/userOrgRole/getPlatformUser';
    const options = {isCommonHttpHeader: true};
    return this.http.post(url, params, options);
  }

  // 添加编辑学科
  saveMajor(params) {
    const url = 'pkg/major/save';
    const options = {isCommonHttpHeader: true};
    return this.http.postBody(url, params, options);
  }

  // 获取所有产品线
  getAllLine() {
    const options = {
      isCommonHttpHeader: true
    };
    return this.http.get('sys/productLine/getList', {status: 1}, options);
  }
}
