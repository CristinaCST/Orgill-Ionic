import {Injectable} from "@angular/core";
import {Network} from "@ionic-native/network";
import * as Constants from "../../util/constants";
import * as Strings from "../../util/strings";
import {PopoversService} from "../popovers/popovers";

@Injectable()
export class NetworkService {

  constructor(private network: Network, private popoversProvider: PopoversService) {
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
    let content = this.popoversProvider.setContent(Strings.GENERIC_MODAL_TITLE, Strings.POPOVER_TIMEOUT_ERROR_MESSAGE, "Open Data", "Open WIFI")
    this.popoversProvider.show(content);
  }
}
