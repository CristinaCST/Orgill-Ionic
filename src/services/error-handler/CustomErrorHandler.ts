import { IonicErrorHandler } from 'ionic-angular';
import { PopoversService, PopoverContent } from '../popovers/popovers';
import * as Strings from '../../util/strings';
import { Injectable } from '@angular/core';
import { LoadingService } from '../loading/loading';

@Injectable()
export class CustomErrorHandlerService implements IonicErrorHandler {

  constructor(private readonly popoversProvider: PopoversService, public loadingService: LoadingService) {
  }

  public async handleError(error: any): Promise<void> {
    console.error('Custom error ', error);

    let errorString: string = Strings.SOMETHING_WENT_WRONG;

    // HACK: Experimental auth error handling
    // TODO: Connect this with constants
    if (error.error && error.error.Message) {
      if (error.error.Message.indexOf('overflow') > -1) {
        errorString = Strings.QUANTITY_TOO_HIGH_OVERFLOW;
      }
    }

    // TODO: Which one it IS
    if (error.message) {
      if (error.message.indexOf('Unauthorized') > -1) {
        errorString = Strings.LOGIN_ERROR_REQUIRED;
      }
    }

    if (error.statusText) {
      if (error.statusText.indexOf('Unauthorized') > -1) {
        errorString = Strings.LOGIN_ERROR_REQUIRED;
      }
    }

    const content: PopoverContent = this.popoversProvider.setContent(Strings.DEFAULT_HTTP_ERROR, errorString);
    this.showErrorModal(content);
  }

  public showErrorModal(content: PopoverContent): void {
    LoadingService.hideAll();
    this.popoversProvider.show(content);
  }
}
