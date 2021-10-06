import {Injectable} from '@angular/core';
import {HttpService} from 'core/services/http.service';
import {ServicesModule} from '@app/service/service.module';

@Injectable({
  providedIn: ServicesModule
})
export class TrainManageService {
  constructor(private http: HttpService) {
  }

  // 行业查询
  searchMajor(params = {}) {
    const url = 'res/knowledgeIndustry/list';
    const options = {isCommonHttpHeader: true};
    return this.http.post(url, params, options);
  }

  // 账期id
  getAccountPeriodId(id) {
    const url = 'res/knowledgeCompanyAccount/get';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, {id}, options);
  }

  delComparys(id) {
    const url = 'res/knowledgeIndustry/delPractical';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, {id}, options);
  }


  // 获取实训连接
  getPracticalDetail(param) {
    const url = 'third/internship/getFixedLink';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, param, options);
  }

  // 添加编辑行业
  saveMajor(params = {}) {
    const url = 'res/knowledgeIndustry/save';
    const options = {isCommonHttpHeader: true};
    return this.http.postBody(url, params, options);
  }

  // 查询行业信息
  listAllByOrgcode(params = {}) {
    const url = 'res/knowledgeIndustry/listAllByOrgcode';
    const options = {isCommonHttpHeader: true};
    return this.http.post(url, params, options);
  }


  // 查询行业下公司
  listAllCompary(params = {}) {
    const url = 'res/knowledgeIndustry/treeList';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, params, options);
  }

  // 添加编辑公司
  saveCompary(params = {}) {
    const url = 'res/knowledgeCompany/save';
    const options = {isCommonHttpHeader: true};
    return this.http.postBody(url, params, options);
  }

  // 添加编辑公司
  delCompary(params = {}) {
    const url = 'res/knowledgeCompany/del';
    const options = {isCommonHttpHeader: true};
    return this.http.post(url, params, options);
  }

  // 新增实训
  savePractical(params = {}) {
    const url = 'res/courseware/savePractical';
    const options = {isCommonHttpHeader: true};
    return this.http.postBody(url, params, options);
  }

  // 实训查询
  queryPracticalPage(param) {
    const url = 'res/resource/queryPracticalPage';
    const options = {isCommonHttpHeader: true};
    return this.http.postBody(url, param, options);
  }

  // 删除
  // delPracticalById(param) {
  //   const url = 'res/resource/delPracticalById/' + param.id;
  //   const options = { isCommonHttpHeader: true};
  //   return this.http.post(url, param, options);
  // }

  // 预览
  getPracticalById(param) {
    const url = 'res/resource/getPracticalById/' + param.id;
    const options = {isCommonHttpHeader: true};
    return this.http.post(url, param, options);
  }

}
