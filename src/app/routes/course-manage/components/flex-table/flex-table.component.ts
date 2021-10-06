import {AfterViewChecked, Component} from '@angular/core';
import {timer} from 'rxjs';

@Component({
  selector: 'app-flex-table',
  template: ``
})
export class FlexTableComponent implements AfterViewChecked {
  dom: any;
  height;
  lock = false;
  limitHeight = 60;

  constructor() {
  }

  ngAfterViewChecked() {
    if (!this.dom) {
      if (!this.lock) {// 性能锁
        this.lock = true;
        const dom = document.getElementById('tableScroll'); // detached状态可能为空
        if (dom) {
            timer(0).subscribe(() => {
              this.dom = document.getElementById('tableScroll'); // 异步渲染从渲染树重新获取
              if (this.dom) {
                this.height = this.dom.clientHeight - this.limitHeight; // 动态获取计算后的高度
              }
              this.lock = false;
            });
        } else {
          this.lock = false;
        }
      }
    } else {
      const dom = document.getElementById('tableScroll');
      if (dom && (dom.clientHeight - this.limitHeight) !== this.height) {
        if (!this.lock) {
          this.lock = true;
          if (dom) {
            timer(0).subscribe(() => {
              this.dom = document.getElementById('tableScroll');
              if (this.dom) {
                this.height = this.dom.clientHeight - this.limitHeight;
              }
              this.lock = false;
            });
          } else {
            this.lock = false;
          }
        }
      }
    }
  }
}
