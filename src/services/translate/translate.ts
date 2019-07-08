import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DEBUG_TRANSLATIONS } from '../../util/constants';

@Injectable()
export class TranslateWrapperService {

  constructor(private readonly translateService: TranslateService) {
  }

  public translate(key: string): string {
    let result: string = '';
    this.translateService.get(key).subscribe(value => {
      result = value;
    });

    if (DEBUG_TRANSLATIONS) {
      console.log('Translation:' + result);
    }

    // Handle the case when translation is not ready
    if (!result) {
      if (DEBUG_TRANSLATIONS) {
        console.warn('TRANSLATOR WAS LAZY');
      }

      result = this.translateService.instant(key);
      console.warn('Instant translation:' + result);
      if (!result || result === key) {
        if (DEBUG_TRANSLATIONS) {
          console.error('-------TRANSLATION FAILED FOR KEY:' + key);
        }
        result = '';
      }
    }

    return result;
  }
}
