import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {ServicesModule} from '@app/service/service.module';

@Injectable({
  providedIn: ServicesModule
})
export class MessageService {
  private subject = new BehaviorSubject<any>(null);

  sendMessage(obj) {
    this.subject.next(obj);
  }

  clearMessage() {
    return this.subject.unsubscribe();
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }
}
