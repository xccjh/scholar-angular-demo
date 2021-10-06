import {
  Component,
  OnInit,
  Injector,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { HttpService } from 'core/services/http.service';
import { NzMessageService } from 'ng-zorro-antd';
import { Observable } from 'rxjs';
import { LocalStorageUtil } from 'core/utils/localstorage.util';
import {PAGE_CONSTANT} from "core/base/static-data";

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'qkc-course-member',
  templateUrl: './course-member.component.html',
  styleUrls: ['./course-member.component.less'],
})
export class CourseMemberComponent implements OnInit, OnChanges {
  data = [];
  total = 0;
  isLoading = false;
  pageIndex = PAGE_CONSTANT.page;
  pageSize = PAGE_CONSTANT.limit;
  curUser: any = {};
  memberId: string = null;

  charge: any = {};
  @Input() id: string;

  constructor(private injector: Injector, private nzMsg: NzMessageService) {}

  get httpService() {
    return this.injector.get(HttpService);
  }

  ngOnInit(): void {
    this.curUser = LocalStorageUtil.getUser();
  }

  ngOnChanges(change: SimpleChanges): void {
    if (change['id']) {
      this.searchData();
    }
  }

  searchData(): void {
    this.getModuleMember(this.id).subscribe(
      (result) => {
        this.data = result;
        this.total = this.data.length;
        // 负责人
        this.charge = this.data.find((item) => item.memberType === '1');
        console.log(this.charge);
      },
      (error) => {}
    );
  }

  add(): void {
    if (this.curUser.id !== this.charge.memberId) {
      this.nzMsg.warning('你不是该模块负责人，不能添加成员');
      return;
    }
    if (!this.memberId) {
      this.nzMsg.warning('请选择成员');
      return;
    }
    this.saveModuleMember(this.id, this.memberId, '2').subscribe(
      (result) => {
        this.searchData();
      },
      (error) => {}
    );
  }

  del(id: string) {
    this.delModuleMember(id).subscribe(
      (result) => {
        this.searchData();
      },
      (error) => {}
    );
  }

  getModuleMember(knowledgeModuleId: string): Observable<any> {
    return new Observable<any>((observe) => {
      const options = {
        isCommonHttpHeader: true,
      };
      const param = {
        knowledgeModuleId,
        limit: this.pageSize,
        page: this.pageIndex,
      };
      this.httpService
        .post('res/knowledgeModuleUser/listMember', param, options)
        .subscribe(
          (result) => {
            if (result.status === 200) {
              observe.next(result.data);
            }
            observe.unsubscribe();
          },
          (error) => {
            observe.error(error);
          }
        );
    });
  }

  // memberType: 1.负责人 2.普通成员
  saveModuleMember(
    knowledgeModuleId: string,
    memberId: string,
    memberType: string
  ): Observable<any> {
    return new Observable<any>((observe) => {
      const options = {
        isCommonHttpHeader: true,
      };
      const param = {
        knowledgeModuleId,
        memberId,
        memberType,
      };
      this.httpService
        .post('res/knowledgeModuleUser/save', param, options)
        .subscribe(
          (result) => {
            if (result.status === 201) {
              observe.next(result.data);
            }
            observe.unsubscribe();
          },
          (error) => {
            observe.error(error);
          }
        );
    });
  }

  delModuleMember(id: string): Observable<any> {
    return new Observable<any>((observe) => {
      const options = {
        isCommonHttpHeader: true,
      };
      const param = {
        id,
      };
      this.httpService
        .post('res/knowledgeModuleUser/del', param, options)
        .subscribe(
          (result) => {
            if (result.status === 204) {
              observe.next(result);
            }
            observe.unsubscribe();
          },
          (error) => {
            observe.error(error);
          }
        );
    });
  }
}
