import {Component, OnInit, Input, forwardRef} from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';
import {KnowledgeManageService} from '../../busi-services';
import {DisciplineDataType, ProfessionalParams} from 'core/base/common';
import {ToolsUtil} from 'core/utils/tools.util';
import {NzMessageService} from 'ng-zorro-antd/message';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'qkc-discipline-data',
  templateUrl: './discipline-data.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DisciplineDataComponent),
      multi: true
    },
    KnowledgeManageService,
    NzMessageService
  ]
})
export class DisciplineDataComponent implements OnInit, ControlValueAccessor {

  constructor(private knowledgeManageService: KnowledgeManageService,
              private nzMsg: NzMessageService,
  ) {
  }

  isMajorLoading = false;
  disciplineId: string;
  disciplineData: DisciplineDataType[] = [];
  orgCode = ToolsUtil.getOrgCode();
  @Input() placeholder: string;
  @Input() style: string;

  private onModelChange = (_: any) => {
  }


  ngOnInit() {
    this.getProfessional();
  }

  writeValue(id: string): void {
    this.disciplineId = id;
  }

  registerOnChange(fn: any): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState?(isDisabled: boolean): void {
  }

  disciplineDataChange(courseProviderId: string) {
    this.onModelChange(courseProviderId);
  }

  private getProfessional(): void {
    this.isMajorLoading = true;
    const param: ProfessionalParams = {
      page: 1,
      limit: 1000,
      orgCode: this.orgCode,
      searchKey: '',
      startTime: '',
      endTime: '',
      filterKey: 'MANAGER'
    };
    const success = (res) => {
      this.isMajorLoading = false;
      if (res.status === 200) {
        this.disciplineData = res.data;
      } else {
        this.nzMsg.error(JSON.stringify(res));
      }
    };

    const error = (err) => {
      this.isMajorLoading = false;
      this.nzMsg.error(JSON.stringify(err));
    };
    this.knowledgeManageService.searchMajor(param).subscribe(success, error);
  }
}
