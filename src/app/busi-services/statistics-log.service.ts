import {Injectable} from '@angular/core';
import {HttpService} from 'core/services/http.service';
import {ToolsUtil} from 'core/utils/tools.util';
import {environment} from 'src/environments/environment';
import {ServicesModule} from '@app/service/service.module';
import {Observable} from 'rxjs';
import {map} from 'rxjs/internal/operators';
import {
  AreaZkDataType,
  CommonData, CommonPagination, CommonStructure,
  CourseListDataType, CourseListParams,
  CourseServiceProviderType, NewMajorTypeParams
} from 'core/base/common';
import {STATISTICALRULES} from '../../../core/base/static-data';
import {SessionStorageUtil} from '../../../core/utils/sessionstorage.util';
import {LocalStorageUtil} from '../../../core/utils/localstorage.util';

@Injectable({
  providedIn: ServicesModule
})
export class StatisticsLogService {

  constructor(private http: HttpService) {
  }

  statisticsPacketInfoLog(param) {
    const packetInfo = SessionStorageUtil.getPacketInfo();
    if (packetInfo.status === '1') {
      const options = {isCommonHttpHeader: true};
      this.http.postBody(STATISTICALRULES.recordControlUrl, {
        ...param,
        businessCode: STATISTICALRULES.packetInfo.businessId,
        orgCode: ToolsUtil.getOrgCode(),
        source: 1,
        informationId: packetInfo.pcode,
        userName: LocalStorageUtil.getUser().userName,
        userId: LocalStorageUtil.getUserId()
      }, options).subscribe(() => {
      }, () => {
      });
    }
  }

  packageOperatLog(param) {
    const url = STATISTICALRULES.pageListUrl;
    const options = {isCommonHttpHeader: true};
    return this.http.postBody(url, param, options);
  }
}

