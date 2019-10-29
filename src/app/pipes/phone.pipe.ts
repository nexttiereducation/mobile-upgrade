import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: `phone` })
export class PhonePipe implements PipeTransform {
  /**
   * Finds any string of 10 numbers and formats them as phone numbers.
   * NOTE: This pipe assumes your phone numbers are in this format: 0000000000,
   *       and will convert them to this format: 000.000.0000
   */
  public transform(val: any) {
    const regex = /\d?[\t\f\v ]?([\t\f\v ]|\-|\(|\.)?(\d{3})(\)|[\t\f\v ]|\-|\.)?[\t\f\v ]?(\d{3})(\-|\.)?(\d{4})/g;
    const subst = `$2.$4.$6`;
    // The substituted value will be contained in the result variable
    const result = val.replace(regex, subst);
    return result;
  }
}
