import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {HttpService} from 'core/services/http.service';
import {ServicesModule} from '@app/service/service.module';
import {environment} from 'src/environments/environment';

@Injectable({
  providedIn: ServicesModule
})
export class StandardCoursePkgService {

  options = {isCommonHttpHeader: true};

  constructor(private httpService: HttpService) {
  }

  getCoursePackList() {
    return this.httpService.get(environment.ncCourseType, {}, this.options);
  }

  delCourse(id: string, status): Observable<any> { // 删除课包
    const url = 'pkg/coursePacket/del';
    return this.httpService.post(url, {id, status}, this.options);
  }

}
