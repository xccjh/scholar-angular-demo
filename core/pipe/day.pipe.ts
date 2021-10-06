import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'day'
})
export class DayPipe implements PipeTransform {
  TIME_OF_DAY: number = 24 * 60 * 60 * 1000;

  transform(value: any, ...args: any[]): any {
    if (!value) { return value; }
    if (typeof value !== 'number') {
      throw new Error('Invalid pipe argument for WelcomePipe');
    }
    return parseInt(value / this.TIME_OF_DAY + '', 10) ;
  }

}
