import { Injectable } from '@angular/core';
import { ToolsUtil } from '../utils/tools.util';
import { environment } from 'src/environments/environment';
import {ServicesModule} from '@app/service/service.module';

/**
 * 用于应用启动时
 * 一般用来获取应用所需要的基础数据等
 */
@Injectable({
  providedIn: 'root'
})
export class StartupService {
  constructor() {
  }

  load(): Promise<any> {
    // only works with promises
    // https://github.com/angular/angular/issues/15088
    return new Promise((resolve) => {
      const orgCode = ToolsUtil.getOrgCode();
      if (orgCode) {
        const ow365Arr = environment.ow365.split('?');
        environment.ow365 = `${ow365Arr[0]}?orgCode=${orgCode}&${ow365Arr[1]}`;
        environment.commonViewer = `${environment.commonViewer}?orgCode=${orgCode}`;
      }
      resolve(null);
    });
  }
}
