import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: `keyValue`
})
export class KeyValuePipe implements PipeTransform {
  public transform(value: any): any {
    if (!value) { return; }
    if (typeof value === `string`) {
      value = JSON.parse(value);
    }
    const keyValues = new Array<any>();
    for (const key in value) {
      if (key) {
        keyValues.push({key, value: value[key]});
      }
    }
    return keyValues;
  }
}
