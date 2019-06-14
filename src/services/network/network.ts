import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
import * as Strings from '../../util/strings';
import { PopoversService } from '../popovers/popovers';

@Injectable()
export class NetworkService {

  constructor(private readonly network: Network, private readonly popoversProvider: PopoversService) {
  }

  public listenForNetworkEvents() {
    this.network.onDisconnect()
      .subscribe(() => {
        this.openNetworkModal();
      });

    this.network.onConnect()
      .subscribe(() => {
        this.popoversProvider.closeModal();
      });
  }

  public openNetworkModal() {
    const content = this.popoversProvider.setContent(Strings.GENERIC_MODAL_TITLE, Strings.POPOVER_TIMEOUT_ERROR_MESSAGE, 'Open Data', 'Open WIFI');
    this.popoversProvider.show(content);
  }
}
