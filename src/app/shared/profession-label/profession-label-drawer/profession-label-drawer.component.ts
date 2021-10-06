import { Component, OnInit, Input, Output, EventEmitter, Injector, OnChanges, SimpleChanges} from '@angular/core';
import { ProfessionLabelService } from '../services/profession-label.service';
import { ToolsUtil } from 'core/utils/tools.util';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'qkc-profession-label-drawer',
  templateUrl: './profession-label-drawer.component.html',
  styleUrls: ['./profession-label-drawer.component.less']
})
export class ProfessionLabelDrawerComponent implements OnInit, OnChanges {
  @Input() title = '选择标签';
  @Input() professionId = '';
  @Input() knowledgePointIds: string[] = [];
  /**
   * 外部改变选中的值
   */
  @Input() outsideValue: any;

  @Input() initialData: any[] = [];

  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Output() selectLabelChange = new EventEmitter<any[]>();

  professionLabelArr = [];
  knowledgePointArr = [];
  selectedKnowledgePointArr = [];

  curAllSelectedItems: any[] = [];

  allSelectedItem = [];
  drawerWidth = 720;

  constructor(private injector: Injector) { }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    ToolsUtil.diffInput(changes.professionId, () => this.getProfessionLabel());
    ToolsUtil.diffInput(changes.knowledgePointIds, () => this.getKnowledgePointLabel());
    // ToolsUtil.diffInput(changes["outsideValue"], ()=>this.outsideChange());
    ToolsUtil.diffInput(changes.initialData, () => this.initializeAll());
  }

  get proLabelService() {
    return this.injector.get(ProfessionLabelService);
  }

  open(): void {
    this.visible = true;
    this.visibleChange.emit(true);
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  getProfessionLabel(): void {
    if (this.professionId === null || this.professionId === '') {
      return;
    }

    this.proLabelService.getTags([this.professionId]).subscribe(result => {
      this.professionLabelArr = ToolsUtil.transformLabelTree(result);

      this.initializeData(this.professionLabelArr);
    });
  }

  getKnowledgePointLabel(): void {
    if (this.knowledgePointIds === null || this.knowledgePointIds.length === 0) {
      return;
    }

    this.proLabelService.getTags(this.knowledgePointIds).subscribe(result => {
      this.knowledgePointArr = ToolsUtil.transformLabelTree(result);
      this.initializeDataKnowledge(this.knowledgePointArr);
    });
  }

  labelChange(selectedItems: any[]): void {
    this.curAllSelectedItems = [...this.getSelectedItems(this.professionLabelArr), ...this.selectedKnowledgePointArr];
    this.selectLabelChange.emit(this.curAllSelectedItems);
  }

  getSelectedItems(arr: any[]): any[] {
    let tmpArr = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < arr.length; i++) {
      arr[i].selectedItems = arr[i].selectedItems || [];
      tmpArr = [...tmpArr, ...arr[i].selectedItems];
    }
    return tmpArr;
  }

  outsideChange() {
    this.delValue(this.professionLabelArr, this.outsideValue);
  }

  delValue(arr: any[], key: string) {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < arr.length; i++) {
      arr[i].selectedItems = ((arr[i].selectedItems) as any[]).filter(ele => ele.id !== key);
    }
  }

  initializeAll() {
    this.initializeData(this.professionLabelArr);
    this.initializeDataKnowledge(this.knowledgePointArr);
  }

  initializeData(arr: any[]) {
    if (!Array.isArray(this.initialData)) {
      return;
    }

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < arr.length; i++) {
      const tmp = [];
      this.initialData.forEach(ele => {
        const item = arr[i].child.find(childEle => childEle.id === ele);
        if (item) {
          tmp.push(item);
        }
      });
      arr[i].selectedItems = tmp;
    }
  }

  initializeDataKnowledge(arr: any[]) {
    if (!Array.isArray(this.initialData)) {
      return;
    }
    const tmp = [];
    this.initialData.forEach(ele => {
      const item = arr.find(childEle => childEle.id === ele);
      if (item) {
        tmp.push(item);
      }
    });
    this.selectedKnowledgePointArr = tmp;
  }


}
