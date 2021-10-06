import { Pipe, PipeTransform } from '@angular/core';
import { getName } from 'core/base/static-data';

@Pipe({
  name: 'restype'
})
export class RestypePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    let groups = ['EXERCISE_TYPE'];
    if (args.length > 0) {
      groups = args;
    }
    if (!value) { return value; }
    if (typeof value !== 'string') {
      throw new Error('Invalid pipe argument for WelcomePipe');
    }
    let name = '--';
    for (const obj of groups) {
      name = getName(value, obj);
      if (name) {
        return name;
      }
    }
    return name;
  }

}
