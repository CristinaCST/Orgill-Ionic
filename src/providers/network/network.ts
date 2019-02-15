import {Injectable} from "@angular/core";
import {Network} from "@ionic-native/network";
import * as Constants from "../../util/constants";
import {PopoversProvider} from "../popovers/popovers";

@Injectable()
export class NetworkProvider {

  constructor(private network: Network, private popoversProvider: PopoversProvider) {
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
    let content = this.popoversProvider.setContent(Constants.O_ZONE, Constants.POPOVER_TIMEOUT_ERROR_MESSAGE, "Open Data", "Open WIFI")
    this.popoversProvider.show(content);
  }
}
