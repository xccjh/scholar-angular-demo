import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-empty-code-page',
  templateUrl: './empty-code-page.component.html',
  styleUrls: ['./empty-code-page.component.less']
})
export class EmptyCodePageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  goOfficialWebsite() {
    const url = window.location.origin.indexOf('test') > -1 ? 'http://mngtest.w-deer.com/' : 'http://www.qicourse.cn/';
    window.open(url);
  }

}
