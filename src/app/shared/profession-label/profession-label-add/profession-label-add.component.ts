import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'qkc-profession-label-add',
  templateUrl: './profession-label-add.component.html',
  styleUrls: ['./profession-label-add.component.less']
})
export class ProfessionLabelAddComponent implements OnInit {

  isShow = false;
  @Input() notPermitedShow = false;

  @Input() placeholder = '';
  @Input() title = '';
  @Input() level;
  @Input() permitedAdd = true;

  value = '';
  @Output() addChange = new EventEmitter<object>();
  @Output() showChange = new EventEmitter<boolean>();

  constructor(private nzMsg: NzMessageService) { }

  ngOnInit() {
  }

  add() {
    if (this.notPermitedShow) {
      this.nzMsg.warning('你已经在添加模式了，请处理完在添加！');
      return;
    }
    this.isShow = true;
    this.showChange.emit(true);
  }

  close() {
    this.isShow = false;
    this.showChange.emit(false);
  }

  confirm() {
    const value = this.value.trim();
    if ( value === '') {
      this.nzMsg.warning('请输入数据，不能空！');
      return;
    }
    this.addChange.emit({value, level: this.level});
    setTimeout(() => {
      this.isShow = false;
      this.value = '';
    }, 100);
  }

}
