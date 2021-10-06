import { Injectable } from '@angular/core';
import {HttpService} from './http.service';
import {ToolsUtil} from '../utils/tools.util';
import {ServicesModule} from '@app/service/service.module';

@Injectable({
  providedIn: ServicesModule
})
export class ApiService {

  constructor(private httpService: HttpService) {}

  login(params: any) {
    return this.httpService.post('stu/student/login', params, ToolsUtil.getHttpOptions());
  }
  loginByPhone(params: any) {
    return this.httpService.post('stu/student/getStuInfoByPhone', params, ToolsUtil.getHttpOptions());
  }

  getClassList(studentId) {
    return this.httpService.get('tch/classMarketStudent/list/stuId', {studentId}, ToolsUtil.getHttpOptions());
  }

  getInfo(orgCode) {
    return this.httpService.post('sys/org/getByCode', {orgCode}, ToolsUtil.getHttpOptions());
  }

  studentSign(params) {
    return this.httpService.post('tsk/studentSign/signNew', params, ToolsUtil.getHttpOptions());
  }

}
