import { IonicErrorHandler } from 'ionic-angular';
import * as Strings from '../../util/strings';
import { Injectable } from '@angular/core';
import { ErrorScheduler } from '../error-scheduler/error-scheduler';

@Injectable()
export class CustomErrorHandler implements IonicErrorHandler {  

  constructor(private readonly errorScheduler: ErrorScheduler) { }

  public async handleError(error: any): Promise<void> {
    const errorString: string = Strings.SOMETHING_WENT_WRONG;
    console.error("Triggered error show for:" + error);
   // this.errorScheduler.showCustomError(errorString);
   // TODO: Fix this
  }

}
