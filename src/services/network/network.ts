import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
import * as Strings from '../../util/strings';
import { PopoversService, PopoverContent } from '../popovers/popovers';

@Injectable()
export class NetworkService {

  private notified: boolean = false;

  constructor(private readonly network: Network, private readonly popoversService: PopoversService) {

    if (this.network.type === 'none') {
      this.openNetworkModal();
    }
  }

  public listenForNetworkEvents(): void {
    this.network.onDisconnect()
      .subscribe(() => {
        this.notified = false;
        this.openNetworkModal();
      });

    this.network.onConnect()
      .subscribe(() => {
        this.notified = false;
        this.popoversService.closeModal();
      });
  }

  public openNetworkModal(): void {
    if (this.notified) {
      return;
    }

    this.notified = true;
    const content: PopoverContent = this.popoversService.setContent(Strings.GENERIC_MODAL_TITLE, Strings.POPOVER_TIMEOUT_ERROR_MESSAGE, Strings.MODAL_BUTTON_OK);
    this.popoversService.show(content);
  }
}
