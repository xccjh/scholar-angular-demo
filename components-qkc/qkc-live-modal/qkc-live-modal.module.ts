import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModalModule  } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { QkcLiveModalComponent } from './qkc-live-modal.component';



@NgModule({
  declarations: [QkcLiveModalComponent],
  imports: [
    CommonModule,
    DragDropModule,
    NzModalModule,
    NzIconModule,
    NzButtonModule
  ],
  exports: [QkcLiveModalComponent]
})
export class QkcLiveModalModule { }
