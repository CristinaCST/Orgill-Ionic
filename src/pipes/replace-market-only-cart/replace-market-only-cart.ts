import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the ReplaceMarketOnlyCartPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'replaceMarketOnlyCart'
})
export class ReplaceMarketOnlyCartPipe implements PipeTransform {
  /**
   * Replaces 'Market Only Cart' with 'Buying Events Cart'.
   */
  public transform(value: string): string {
    return value === 'Market Only Cart' ? 'Buying Events Cart' : value;
  }
}
