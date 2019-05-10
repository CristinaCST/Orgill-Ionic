import {Injectable} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {DEBUG_TRANSLATIONS} from "../../util/constants";

@Injectable()
export class TranslateProvider {

  constructor(private translateService: TranslateService) {
  }

  translate(key: string): string {
    let result: string = "";
    this.translateService.get(key).subscribe(value => {
      result = value;
    });

    if(DEBUG_TRANSLATIONS){
      console.log("Translation:" + result);
    }

    //HACK: Experimental workaround over lazy translator:
    if(result===""){
      console.warn("TRANSLATOR WAS LAZY");

      result = this.translateService.instant(key);
      if(result==="" && DEBUG_TRANSLATIONS)
      {
        console.error("-------TRANSLATION FAILED FOR KEY:" + key);
      }
    }

    return result;
  }
}
