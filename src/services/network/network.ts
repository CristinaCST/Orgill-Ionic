import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
import * as Strings from '../../util/strings';
import { PopoversService, PopoverContent } from '../popovers/popovers';
import { ReloadService } from '../../services/reload/reload';
import { ErrorScheduler } from '../../services/error-scheduler/error-scheduler';

@Injectable()
export class NetworkService {

  public notified: boolean = false;
  public connectionStatus: boolean = true;
  public static firstConnect: boolean = true;
  constructor(private readonly network: Network, private readonly popoversService: PopoversService, private readonly reloadService: ReloadService) {

    if (this.network.type === 'none') {
      this.connectionStatus = false;
      NetworkService.firstConnect = false;
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
        this.reloadService.announceRetry();
        if (!NetworkService.firstConnect) {
          NetworkService.firstConnect = true;
        }
      });
  }
  private checkConnectionManually(): void {
    this.connectionStatus = this.network.type === 'none' ? false : true;
  }

  public openNetworkModal(): void {
    this.checkConnectionManually();

    if (this.notified || ErrorScheduler.scheduledError !== undefined) {
      this.notified = false;
      return;
    }
    if (this.connectionStatus) {
      ErrorScheduler.scheduledError = this;
      this.reloadService.announceRetry();
      ErrorScheduler.scheduledError = undefined;
      this.notified = false;
      return;
    }

    ErrorScheduler.scheduledError = this;
    const content: PopoverContent = this.popoversService.setContent(Strings.GENERIC_MODAL_TITLE, Strings.POPOVER_NETWORK_OFFLINE_MESSAGE, Strings.MODAL_BUTTON_TRY_AGAIN);
    this.popoversService.show(content).subscribe(res => {
      ErrorScheduler.scheduledError = undefined;
      this.openNetworkModal();

    });
  }

 
}
