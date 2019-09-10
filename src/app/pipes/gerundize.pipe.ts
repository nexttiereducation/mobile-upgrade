import { Pipe, PipeTransform } from '@angular/core';
import { endsWith, join, trimEnd, words } from 'lodash';

@Pipe({
  name: `gerundize`
})
export class GerundizePipe implements PipeTransform {
  /**
   * Takes a string of words and transforms one of them into a gerund.
   */
  public transform(val: string, wordIndex: number = 0) {
    const wordArray = words(val);
    let word = wordArray[wordIndex];
    if (endsWith(word, `e`)) {
      word = trimEnd(word, `e`);
    }
    word += `ing`;
    wordArray.splice(0, 1, word);
    const newVal = join(wordArray, ` `);
    return newVal;
  }
}
