
import { Injectable } from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

@Injectable()
export class TranslateProvider {

  constructor(private translateService: TranslateService) {
  }


  //TODO: (translate) Mihaela: fix this!
  translate(key: string): string {

    let result: string;
    this.translateService.get(key).subscribe(value => {
      result = value;
    });
    return result

  }
}
