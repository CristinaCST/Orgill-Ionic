import {IonicErrorHandler} from "ionic-angular";
import {PopoversProvider} from "../../providers/popovers/popovers";
import * as Strings from "../../util/strings";
import {Injectable} from "@angular/core";
import {LoadingService} from "../loading/loading";

@Injectable()
export class CustomErrorHandlerService implements IonicErrorHandler {

  constructor(private popoversProvider: PopoversProvider, public loadingService: LoadingService) {
  }

  async handleError(error: any) {
    console.error('Custom error ', error);

    let errorString = Strings.SOMETHING_WENT_WRONG;

    //HACK: Experimental auth error handling
    if (error.error && error.error.Message) {
      if (error.error.Message.indexOf("Authentication") > -1) {
        console.warn("We should prompty re-authentication right now")
        errorString = Strings.LOGIN_ERROR_REQUIRED;
      }
      if (error.error.Message.indexOf("overflow") > -1) {
        errorString = Strings.QUANTITY_TOO_HIGH_OVERFLOW;
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
