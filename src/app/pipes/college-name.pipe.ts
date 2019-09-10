import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: `collegeName`
})
export class CollegeNamePipe implements PipeTransform {
  transform(college: any, shorten?: boolean, maxLength: number = 24): any {
    let name: string = college.name || college.institution_name || college.institution.name;
    if (shorten && name.length > maxLength) {
      if (name.indexOf(`University`) !== -1) {
        name = name.replace(`University`, `U`);
      } else if (name.indexOf(` College`) !== -1) {
        name = name.replace(` College`, ``);
      }
      if (name.length > maxLength) {
        name = name.replace(` Campus`, ``);
      }
    }
    return name;
  }
}
