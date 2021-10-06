import { Component, OnInit, Injector, Input, OnChanges, SimpleChanges } from '@angular/core';

import { ProfessionLabelService } from '../services/profession-label.service';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'qkc-profession-label-item',
  templateUrl: './profession-label-item.component.html',
  styleUrls: ['./profession-label-item.component.less']
})
export class ProfessionLabelItemComponent implements OnInit, OnChanges {

  @Input() pid: string;
  // 标签分类 学科便签：11  知识标签：12
  @Input() tagType: string;
  // 层级
  @Input() tagLevel: string;

  @Input() labelArr = [];

  constructor(private injector: Injector) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (this.tagType === '12') {
      this.proLabelService.getTags(this.pid).subscribe(result => {
        this.labelArr = result;
      });
    }
  }

  get proLabelService() {
    return this.injector.get(ProfessionLabelService);
  }

  addTagChange(val: {value: string, level: number}): void {
    this.proLabelService.saveTags('', val.value, this.pid, this.tagType, val.level.toString()).subscribe(result => {
      if (this.labelArr) {
        this.labelArr = [...this.labelArr, result];
      } else {
        this.labelArr = [result];
      }

    },
    error => {

    });
  }

  inputDelChange(id: string): void {
    this.labelArr = this.labelArr.filter(el => el.id !== id);
  }


}
