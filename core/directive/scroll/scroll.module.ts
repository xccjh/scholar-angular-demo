import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollDirective } from './scroll.directive';

import { QkcScrollService } from './service/qkc-scroll.service';

@NgModule({
  declarations: [ScrollDirective],
  imports: [
    CommonModule
  ],
  exports: [ScrollDirective],
  providers: [
    QkcScrollService
  ]
})
export class ScrollModule { }
