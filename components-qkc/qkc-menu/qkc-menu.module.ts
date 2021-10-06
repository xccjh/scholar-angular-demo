import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NzMenuModule } from 'ng-zorro-antd/menu';
import { QkcMenuComponent } from './qkc-menu.component';
import { NzAnchorModule } from 'ng-zorro-antd/anchor';
@NgModule({
  declarations: [QkcMenuComponent],
  imports: [
    CommonModule,
    NzMenuModule,
    NzAnchorModule
  ],
  exports: [
    QkcMenuComponent
  ]
})
export class QkcMenuModule { }
