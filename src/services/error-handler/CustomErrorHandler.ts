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
    console.error('Custom error', error);
    let content = this.popoversProvider.setContent(Strings.DEFAULT_HTTP_ERROR, Strings.SOMETHING_WENT_WROMG);
    this.showErrorModal(content)
  }

  showErrorModal(content) {
    LoadingService.hideAll();
    this.popoversProvider.show(content);
  }
}
