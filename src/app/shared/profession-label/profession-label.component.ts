import { Component, OnInit, Injector, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ProfessionLabelService } from './services/profession-label.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'qkc-profession-label',
  templateUrl: './profession-label.component.html',
  styleUrls: ['./profession-label.component.less']
})
export class ProfessionLabelComponent implements OnInit, OnChanges {

  labelArr = [];

  labelValue = '';

  isEdit = false;

  curItem: any;

  @Input() pid: string;

  constructor(private injector: Injector) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.proLabelService.getTags([this.pid]).subscribe(result => {

      this.labelArr = this.initialData(result);
    });
  }

  initialData(data: any[]): any[] {
    data.forEach(el => {
      el.isEdit = false;
    });
    return data;
  }

  get proLabelService() {
    return this.injector.get(ProfessionLabelService);
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.labelArr, event.previousIndex, event.currentIndex);
  }

  add(val: {value: string, level: number}): void {
    this.proLabelService.saveTags('', val.value, this.pid, '11', val.level.toString()).subscribe(result => {
      this.labelArr = [...this.labelArr, result];
    },
      error => {

      });
  }

  edit(item: any): void {
    this.curItem = item;
    this.labelValue = item.tagName;
    this.curItem.isEdit = true;
  }

  inputEnter(): void {
    this.proLabelService.saveTags(
      this.curItem.id,
      this.labelValue,
      this.curItem.pid,
      this.curItem.tagType,
      this.curItem.tagLevel
    ).subscribe(result => {
      this.curItem.tagName = this.labelValue;
      this.curItem.isEdit = false;
    }, error => {

    });
  }

  del(id: string): void {
    this.proLabelService.delTags(id).subscribe(result => {

    },
      error => {

      });
  }

}
