import { Injectable, EventEmitter } from '@angular/core';
import {filter} from 'rxjs/operators';
import {ServicesModule} from '@app/service/service.module';

@Injectable({
  providedIn: ServicesModule
})
export class NotifyService  {

  courseList  = new EventEmitter<any>();

  lookAnswer = new EventEmitter<any>();

  showLive = new EventEmitter<any>();

  teachType = new EventEmitter<any>();

  notify$ = new EventEmitter<any>();

  constructor() {
  }

  getNotify(pageId: string) {
    return this.notify$.pipe(
      filter(res => res.id === pageId)
    );
  }

  emitNotify(data: any) {
    this.notify$.emit(data);
  }

}
