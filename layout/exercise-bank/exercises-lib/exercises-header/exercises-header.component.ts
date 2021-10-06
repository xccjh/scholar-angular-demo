import {Component, OnInit, Input, OnChanges, SimpleChange, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {LocalStorageUtil} from '../../../../core/utils/localstorage.util';


@Component({
  selector: 'app-exercises-header',
  templateUrl: './exercises-header.component.html',
  styleUrls: ['./exercises-header.component.less']
})
export class ExerciseseaderComponent implements OnInit {

  title = SessionStorageUtil.getPacketInfoItem('name');

  constructor(
    private router: Router,
  ) {
  }

  ngOnInit() {
  }

  goback() {

    const path = LocalStorageUtil.getBackUrl();
    if (path) {
      this.router.navigateByUrl(path);
    } else {
      this.router.navigateByUrl('p/structure?flat=new');
    }
  }
}
