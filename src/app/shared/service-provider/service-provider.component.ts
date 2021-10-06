import {Component, OnInit, Input, forwardRef} from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';
import {CourseManageService} from '../../busi-services';
import {CourseServiceProviderType} from '../../../../core/base/common';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'qkc-service-provider',
  templateUrl: './service-provider.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ServiceProviderComponent),
      multi: true
    },
    CourseManageService
  ]
})
export class ServiceProviderComponent implements OnInit, ControlValueAccessor {

  constructor(private courseMgService: CourseManageService) {
  }

  isServiceProviderLoading = false;
  courseProviderId: string;
  courseServiceProvider: CourseServiceProviderType[] = [];
  @Input() placeholder: string;
  @Input() style: string;

  private onModelChange = (_: any) => {
  }

  ngOnInit() {
    this.getServiceProvider();
  }

  writeValue(id: string): void {
    this.courseProviderId = id;
  }

  registerOnChange(fn: any): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState?(isDisabled: boolean): void {
  }

  courseProviderChange(courseProviderId: string) {
    this.onModelChange(courseProviderId);
  }

  private getServiceProvider(): void {
    this.isServiceProviderLoading = true;
    this.courseMgService.getMajorList().subscribe(res => {
      this.isServiceProviderLoading = false;
      if (res.status === 200) {
        this.courseServiceProvider = res.data;
      }
    }, err => {
      this.isServiceProviderLoading = false;
    });
  }

}
