import {IonicErrorHandler} from "ionic-angular";
import {PopoversProvider} from "./popovers/popovers";
import * as Strings from "../util/strings";
import {Injectable} from "@angular/core";
import {LoadingProvider} from "./loading/loading";

@Injectable()
export class CustomErrorHandler implements IonicErrorHandler {

  constructor(private popoversProvider: PopoversProvider, public loading: LoadingProvider) {
  }

  async handleError(error: any) {
    console.error('Custom error', error);
    let content = this.popoversProvider.setContent(Strings.DEFAULT_HTTP_ERROR, Strings.SOMETHING_WENT_WROMG);
    this.showErrorModal(content)
  }

  showErrorModal(content) {
    this.loading.hideLoading();
    this.popoversProvider.show(content);
  }
}
