import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'qkc-menu',
  templateUrl: './qkc-menu.component.html',
  styleUrls: ['./qkc-menu.component.less']
})
export class QkcMenuComponent implements OnInit {

  @Input() menus: {name: string, [key: string]: any}[] = [];
  @Input() defaultSelect: string | number;
  @Output() menuChange = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  selectItem(item: {name: string, [key: string]: any}) {
    this.menuChange.emit(item);
  }

}
