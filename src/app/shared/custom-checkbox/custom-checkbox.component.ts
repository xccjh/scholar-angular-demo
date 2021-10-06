import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { EXERCISE_TYPE, RESOURCE_SCEN, LEARNING_TARGET , MATERIAL_TYPE} from 'core/base/static-data';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'qkc-custom-checkbox',
  templateUrl: './custom-checkbox.component.html',
  styleUrls: ['./custom-checkbox.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomCheckboxComponent),
      multi: true
    }
  ]
})
export class CustomCheckboxComponent implements OnInit, ControlValueAccessor {

  @Input() isBorder = false;

  @Input() type = '';

  @Input() output: 'obj' |  '' = '';

  @Input() labelArr: any[] = [];

  @Input() fitter: string[] = [];

  selectedItems: any[] = [];


  private onModelChange = (_: any) => { };

  constructor() { }

  ngOnInit() {
    if (this.type === 'material_type') {
      this.labelArr = MATERIAL_TYPE.filter(item => !this.fitter.includes(item.id));
    } else if (this.type === 'res_scene') {
      this.labelArr = RESOURCE_SCEN.filter(item => !this.fitter.includes(item.id));
    } else if (this.type === 'learn_goal') {
      this.labelArr = LEARNING_TARGET.filter(item => !this.fitter.includes(item.id));
    } else if (this.type === 'exercise_type') {
      this.labelArr = EXERCISE_TYPE.filter(item => !this.fitter.includes(item.id));
    }
  }

  writeValue(ids: string | any[]): void {
    if ( typeof ids === 'string') {
      this.selectedItems = ids.split(',');
    } else if (ids instanceof Array) {
      this.selectedItems = ids;
    }
  }

  registerOnChange(fn: any): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState?(isDisabled: boolean): void {

  }

  isContain(item): number {
    if (this.output === 'obj') {
     return this.selectedItems.indexOf(item);
    } else {
      return this.selectedItems.indexOf(item.id);
    }
  }

  modifySelectedItems(idx: number, item: any) {
    if (this.output === 'obj') {
      idx >= 0 ? this.selectedItems.splice(idx, 1) : this.selectedItems.push(item);
    } else {
      idx >= 0 ? this.selectedItems.splice(idx, 1) : this.selectedItems.push(item.id);
    }
  }

  selectItem(item: any) {
    // const index = this.selectedItems.indexOf(item.id);
    // index >= 0 ? this.selectedItems.splice(index, 1) : this.selectedItems.push(item.id);
    this.modifySelectedItems(this.isContain(item), item);
    console.log(this.selectedItems);
    this.onModelChange(this.selectedItems);
  }

}
