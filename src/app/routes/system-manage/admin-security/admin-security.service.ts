import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'core/services/http.service';

@Injectable({
  providedIn: 'root'
})
export class AdminSecurityService {

  constructor(private httpService: HttpService) { }
  // 获取管理员信息
  getAdminInfo(params: any): Observable<any> {
    const url = 'sys/user/get';
    const options = { isCommonHttpHeader: true };
    return this.httpService.post(url, params, options);
  }

  // 用户修改密码
  sendModifyPassword(params: any): Observable<any> {
    const url = 'sys/user/modifyPass';
    const options = { isCommonHttpHeader: true };
    return this.httpService.postBody(url, params, options);
  }
  // 用户修改手机
  sendModifyPhone(params: any): Observable<any> {
    const url = 'sys/user/updatePhone';
    const options = { isCommonHttpHeader: true };
    return this.httpService.post(url, params, options);
  }

  // 获取验证码
  getVerCode(telphone: string): Observable<any> {
    const params = {telphone};
    const url = 'third/sms/sendCode';
    const options = { isCommonHttpHeader: true };
    return this.httpService.post(url, params, options);
  }
  // 校验验证码
  checkCode(code, telphone): Observable<any> {
    const params = {code, telphone};
    const url = 'third/sms/checkCode';
    const options = { isCommonHttpHeader: true };
    return this.httpService.post(url, params, options);
  }
}
