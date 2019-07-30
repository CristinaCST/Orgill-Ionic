import { IonicErrorHandler } from 'ionic-angular';
import { Injectable } from '@angular/core';

@Injectable()
export class CustomErrorHandler implements IonicErrorHandler {  

  public async handleError(error: any): Promise<void> {
//    const errorString: string = Strings.SOMETHING_WENT_WRONG;
    // console.error("Triggered error show for:" + error);
    // this.errorScheduler.showCustomError(errorString);
    // TODO: Fix this
  }

}
