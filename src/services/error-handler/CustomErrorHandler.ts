import {IonicErrorHandler} from "ionic-angular";
import {PopoversService} from "../popovers/popovers";
import * as Strings from "../../util/strings";
import {Injectable} from "@angular/core";
import {LoadingService} from "../loading/loading";

@Injectable()
export class CustomErrorHandlerService implements IonicErrorHandler {

  constructor(private popoversProvider: PopoversService, public loadingService: LoadingService) {
  }

  async handleError(error: any) {
    console.error('Custom error ', error);

    let errorString = Strings.SOMETHING_WENT_WRONG;

    //HACK: Experimental auth error handling
    //TODO: Connect this with constants
    if (error.error && error.error.Message) {
      if (error.error.Message.indexOf("overflow") > -1) {
        errorString = Strings.QUANTITY_TOO_HIGH_OVERFLOW;
      }
    }

    if (error.statusText) {
      if (error.statusText.indexOf("Unauthorized") > -1) {
        errorString = Strings.LOGIN_ERROR_REQUIRED;
      }
    }
    
    let content = this.popoversProvider.setContent(Strings.DEFAULT_HTTP_ERROR, errorString);
    this.showErrorModal(content)
  }

  showErrorModal(content) {
    LoadingService.hideAll();
    this.popoversProvider.show(content);
  }
}
