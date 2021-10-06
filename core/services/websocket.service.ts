import { Injectable, EventEmitter} from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import {ServicesModule} from '@app/service/service.module';
declare const SockJS;
declare const Stomp;

@Injectable({
  providedIn: ServicesModule
})
export class WebSocketService {

  stompClient: any;
  connectSuccess = false;
  waitingSubscribeList = [];
  constructor() { }

  public connectSocket() { // 开启socket连接
    const socket = new SockJS(`${environment.SERVER_URL}msg/realTime`);
    window['socket'] = socket;
    const stompClient = Stomp.over(socket);
    stompClient.connect({}, (message) => {
      console.log('成功连接websocket');
      this.connectSuccess = true;
      // 订阅一个目的地
      // STOMP消息的body必须为字符串
      // stompClient.subscribe('/topic/greetings', (msg) => {
      //   console.log('接受到java后台发送的消息，' + msg.body);
      // });

      if (this.waitingSubscribeList.length > 0) { // 存在等待建立的连接
        this.waitingSubscribeList.map(item => {
          console.log(`与服务器建立一个连接，路径：${item.path}`);
          item.observe.next(this.stompClient.subscribe(item.path, item.callback));
        });
      }
    });

    this.stompClient = stompClient;
  }

  public addSubscribe(path, callback) {
    return new Observable<any>(observe => {
      if (this.connectSuccess) { // 已开启连接
        console.log(`与服务器建立一个连接，路径：${path}`);
        observe.next(this.stompClient.subscribe(path, callback));
      } else {
        this.waitingSubscribeList.push({ observe, path, callback});
        console.log('socket尚未连接，等到建立:' + path);
      }
    });
  }

  // 推送消息
  public sendMessage(path, header, params) {
    this.stompClient.send(path, header, params);
  }

  // 关闭连接
  public closeSocket() {
    if (this.stompClient !== null) {
      this.stompClient.disconnect();
    }
    console.log('断开socket连接');
  }

}
