import {IonicErrorHandler} from "ionic-angular";
import {PopoversProvider} from "./popovers/popovers";
import * as Constants from "../util/constants";
import {Injectable} from "@angular/core";
import {LoadingProvider} from "./loading/loading";
import { TranslateProvider } from "./translate/translate";

@Injectable()
export class CustomErrorHandler implements IonicErrorHandler {

  constructor(private popoversProvider: PopoversProvider, public loading: LoadingProvider, private translateProvider:TranslateProvider) {
  }

  async handleError(error: any) {
    console.error('Custom error', error);
    let content = this.popoversProvider.setContent(this.translateProvider.translate(Constants.DEFAULT_HTTP_ERROR), this.translateProvider.translate(Constants.SOMETHING_WENT_WROMG));
    this.showErrorModal(content)
  }

  showErrorModal(content) {
    this.loading.hideLoading();
    this.popoversProvider.show(content);
  }
}
