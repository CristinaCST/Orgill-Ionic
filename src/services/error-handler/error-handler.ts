import { IonicErrorHandler,  Events } from 'ionic-angular';
import { PopoversService, PopoverContent, DefaultPopoverResult } from '../popovers/popovers';
import * as Strings from '../../util/strings';
import { Injectable } from '@angular/core';
import { LoadingService } from '../loading/loading';
import { ErrorScheduler } from '../error-scheduler/error-scheduler';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class CustomErrorHandler implements IonicErrorHandler {  
  
  public async handleError(error: any): Promise<void> {
    console.error('Custom error ', error);

    let errorString: string = Strings.SOMETHING_WENT_WRONG;
  }

}
