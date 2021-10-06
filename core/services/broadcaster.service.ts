import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {ServicesModule} from '@app/service/service.module';

interface BroadcastEvent {
  key: any;
  data?: any;
}

@Injectable({
  providedIn: ServicesModule
})
export class BroadcastService {
  private eventBus: Subject<BroadcastEvent>;

  constructor() {
    this.eventBus = new Subject<BroadcastEvent>();
  }

  broadcast(key: any, data?: any) {
    this.eventBus.next({key, data});
  }

  on<T>(key: any): Observable<T> {
    return this.eventBus.asObservable().pipe(
      filter(event => event.key === key),
      map(event => event.data as T)
    );

  }
}

// import { Component } from '@angular/core';
//
// @Component({
//   selector: 'child'
// })
// export class ChildComponent {
//   constructor(private broadcaster: Broadcaster) {}
//
//   registerStringBroadcast() {
//     this.broadcaster.on<string>('MyEvent')
//       .subscribe(message => {
//       ...
//       });
//   }
//
//   emitStringBroadcast() {
//     this.broadcaster.broadcast('MyEvent', 'some message');
//   }
// }
