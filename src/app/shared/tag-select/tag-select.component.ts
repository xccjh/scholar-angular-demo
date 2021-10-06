import { Component, Input, forwardRef, Output, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'qkc-tag-select',
  templateUrl: './tag-select.component.html',
  styleUrls: ['./tag-select.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagSelectComponent),
      multi: true
    }
  ]
})
export class TagSelectComponent implements ControlValueAccessor {

  @Input() listOfOption: Array<{ label: string; value: string }> = [];
  listOfTagOptions = [];
  selectedCache = [];

  isShowArrow = false;
  dropdownStyle = { display: 'none' };

  @Input() placeholder = '';
  @Input() model: 'multiple' | 'tags' = 'multiple';
  /**
   * 已废弃
   */
  @Output() delChange = new EventEmitter<any>();

  private onModelChange = (_: any) => { };

  writeValue(selectedOpts: any[]): void {
    if (this.model === 'tags') {
      const arr = [];
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < selectedOpts.length; i++) {
        arr.push({ label: selectedOpts[i], value: selectedOpts[i] });
      }
      this.listOfTagOptions = arr;
    } else {
      this.listOfTagOptions = selectedOpts;
    }
    // console.log(this.listOfTagOptions);
    // if (this.listOfTagOptions !== null && this.listOfTagOptions instanceof Array){
    //   this.selectedCache = [...this.listOfTagOptions];
    // }
  }

  registerOnChange(fn: any): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState?(isDisabled: boolean): void {

  }

  selectChange(selectedOpts: string[]) {
    // this.findDelItem();
    // this.selectedCache = [...selectedOpts];
    this.onModelChange(selectedOpts);
  }

  findDelItem() {
    const diffArr = this.getArrDifference(this.selectedCache, this.listOfTagOptions);
    this.delChange.emit(diffArr[0]);
  }

  getArrDifference(arr1, arr2) {
    return arr1.concat(arr2).filter( (v, i, arr) => {
      return arr.indexOf(v) === arr.lastIndexOf(v);
    });
  }

}
