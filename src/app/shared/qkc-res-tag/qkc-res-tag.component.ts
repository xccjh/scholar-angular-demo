import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'qkc-res-tag',
  templateUrl: './qkc-res-tag.component.html',
  styleUrls: ['./qkc-res-tag.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QkcResTagComponent),
      multi: true
    }
  ]
})
export class QkcResTagComponent implements OnInit, ControlValueAccessor {

  constructor() { }

  @Input() professionId: string;
  @Input() knowledgePointIds: any;

  isShow = false;
  tagArr = [];
  tags = [];

  private onModelChange = (_: any) => { };

  ngOnInit() {
  }

  writeValue(tags: any[]): void {
    this.formatData(tags);
  }

  registerOnChange(fn: any): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState?(isDisabled: boolean): void {

  }


  chooseLabel() {
    this.isShow = true;
  }

  selectLabelChange(items: any[]) {
    this.formatData(items, () => {
      const tags = this.tags.map((ele: any) => ({ tagId: ele, seq: 1 }));
      this.onModelChange(tags);
    });
  }

  formatData(items: any[], callback?: () => void) {
    if (!Array.isArray(items)) {
      return;
    }
    const list = [];
    const key = [];
    items.forEach(ele => {
      list.push({ label: ele.tagName, value: ele.id });
      key.push(ele.id);
    });

    this.tagArr = list;
    setTimeout(() => {
      this.tags = key;
      if (callback) {
        callback();
      }
    }, 0);
  }

}
