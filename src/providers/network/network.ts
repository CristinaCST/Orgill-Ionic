import {Injectable} from "@angular/core";
import {Network} from "@ionic-native/network";
import * as Constants from "../../util/constants";
import {PopoversProvider} from "../popovers/popovers";
import { TranslateProvider } from "../../providers/translate/translate";

@Injectable()
export class NetworkProvider {

  constructor(private network: Network, private popoversProvider: PopoversProvider, private translateProvider: TranslateProvider) {
  }

  public listenForNetworkEvents() {
    this.network.onDisconnect()
      .subscribe(() => {
        this.openNetworkModal()
      });

    this.network.onConnect()
      .subscribe(() => {
        this.popoversProvider.closeModal();
      });
  }

  openNetworkModal() {
    let content = this.popoversProvider.setContent(this.translateProvider.translate(Constants.O_ZONE), this.translateProvider.translate(Constants.POPOVER_TIMEOUT_ERROR_MESSAGE), "Open Data", "Open WIFI")
    this.popoversProvider.show(content);
  }
}
