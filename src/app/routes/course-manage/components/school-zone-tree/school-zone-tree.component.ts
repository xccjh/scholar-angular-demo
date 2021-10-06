import {
  Component,
  OnInit,
  forwardRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Output,
  Input,
  EventEmitter
} from '@angular/core';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';
import {NzTreeNodeOptions} from 'ng-zorro-antd/tree';

@Component({
  selector: 'app-school-zone-tree',
  templateUrl: './school-zone-tree.component.html',
  styleUrls: ['./school-zone-tree.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SchoolZoneTreeComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SchoolZoneTreeComponent implements OnInit, ControlValueAccessor {
  opts: NzTreeNodeOptions[] = [];
  selectedValues: string[] = [];
  expandKeys: string [] = [];
  @Output() schoolZone = new EventEmitter<any>();
  private dataLength = 0;
  private dataPLength = 0;


  constructor(
    private cdr: ChangeDetectorRef,
    private courseMgService: CourseManageService,
    private nzMsg: NzMessageService) {
  }

  private onModelChange = (_: any) => {
  }

  ngOnInit(): void {
    this.collegeList();
  }

  writeValue(values: string[]): void {
    this.selectedValues = values;
    this.detectChange();
  }

  registerOnChange(fn: any): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState?(isDisabled: boolean): void {

  }

  collegeList() {
    this.courseMgService.collegeList('area').subscribe(res => {
      if (res.status !== 200) {
        this.nzMsg.error(res.message);
        return;
      }
      this.opts = [{
        children: this.formatOpts(res.data).filter(e => e.children.length),
        key: 'all',
        title: '所有校区',
        value: 'area-zongbu'
      }];
      this.dataLength = 0;
      this.dataPLength = this.opts.length;
      this.opts.forEach(item => {
        if (item.children && item.children.length) {
          this.dataLength += item.children.length;
        }
      });
      const {opts, dataLength, dataPLength} = this;
      this.schoolZone.emit({opts, dataLength, dataPLength});
      this.detectChange();
    }, err => {
      this.nzMsg.error(JSON.stringify(err));
    });
  }

  formatOpts(data: any[]) {
    const formatChildren = (children: any[]) => {
      if (!children || children.length === 0) {
        return [];
      } else {
        return children.map(school => {
          return {
            key: school.oCode,
            value: school.oCode,
            title: school.orgName,
            isLeaf: true
          };
        });
      }
    };
    return data.map(area => {
      return {
        key: 'AREA_' + area.typeCode,
        value: area.typeCode,
        title: area.typeName,
        children: formatChildren(area.chlidren)
      };
    });
  }

  selectedChange(values: any[]) {
    this.setModalChange(values);
  }

  setModalChange(values: string[]) {
    const selectedValues = values.reduce((pre, cur) => {
      if (cur.startsWith('AREA_')) {
        const schools = this.opts.find(item => item.key === cur).children;
        const schoolKeys = schools.map(school => school.key);
        Array.prototype.push.apply(pre, schoolKeys);
      } else {
        pre.push(cur);
      }
      return pre;
    }, []);
    this.onModelChange(selectedValues);
  }

  detectChange() {
    this.cdr.markForCheck();
  }

}
