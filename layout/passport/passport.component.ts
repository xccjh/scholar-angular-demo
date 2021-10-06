import { Component, OnInit } from '@angular/core';
import { HttpService } from 'core/services/http.service';
import { ToolsUtil } from 'core/utils/tools.util';
import { LocalStorageUtil } from 'core/utils/localstorage.util';


@Component({
  selector: 'app-layout-passport',
  templateUrl: './passport.component.html',
  styleUrls: ['./passport.component.less']
})
export class LayoutPassportComponent implements OnInit {
  logoUrl = 'assets/images/logo.png';
  config: any = {};
  schoolName = '教研工作台';
  orgCode = '';
  defaultUrl = 'assets/images/logo.png';


  constructor(private httpService: HttpService) { }

  ngOnInit() {
    this.orgCode = ToolsUtil.getOrgCode();
    this.getInfo();
  }

  get logoStyle() {
    return {
      'background-image': `url(${this.defaultUrl})`,
      'background-size': 'cover'
    };
  }

  // 获取机构信息
  getInfo() {
    this.httpService.post('sys/org/getByCode', {
      orgCode: this.orgCode
    }).subscribe(res => {
      if ( res.status === 200 ) {
        this.logoUrl =  res.data.logo ? ToolsUtil.getOssUrl( res.data.logo) : this.logoUrl;
        this.schoolName = res.data.orgName;
        // this.defaultUrl = ToolsUtil.getOssUrl(res.data.logo) || this.defaultUrl;
        LocalStorageUtil.putOrgInfo(res.data);
        this.storeSchoolName();
      }
    }, error => {});
  }

  storeSchoolName() {
    LocalStorageUtil.putSchoolName(this.schoolName);
  }

}
