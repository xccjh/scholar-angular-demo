import {Component, OnInit, Input, forwardRef} from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';
import {KnowledgeManageService} from 'src/app/busi-services/knowledge-manag.service';
import {ToolsUtil} from 'core/utils/tools.util';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'qkc-role-member',
  templateUrl: './role-member.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RoleMemberComponent),
      multi: true
    },
    KnowledgeManageService
  ]
})
export class RoleMemberComponent implements OnInit, ControlValueAccessor {

  constructor(private knowledgeManageService: KnowledgeManageService) {
  }

  roleLoading = false;
  userId: string;
  roleArr: any[] = [];
  @Input() placeholder: string;
  @Input() role: string;

  private onModelChange = (_: any) => {
  }

  ngOnInit() {
    this.getRoleList(this.role);
  }

  writeValue(id: string): void {
    this.userId = id;
  }

  registerOnChange(fn: any): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState?(isDisabled: boolean): void {

  }

  roleChange(userId: string) {
    this.onModelChange(userId);
  }

  getRoleList(roleFlag: string) {
    this.roleLoading = true;
    const param = {
      platformId: window['__platform__'],
      subCode: ToolsUtil.getOrgCode()
    };
    this.knowledgeManageService.getChargeList(param).subscribe(
      result => {
        this.roleLoading = false;
        if (result.status === 200) {
          this.roleArr = result.data;
        }
      },
      error => {
        this.roleLoading = false;
      }
    );
  }

}
