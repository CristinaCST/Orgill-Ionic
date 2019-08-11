import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
import { PopoversService } from '../popovers/popovers';
import { ReloadService } from '../../services/reload/reload';
import { ErrorScheduler } from '../../services/error-scheduler/error-scheduler';
import * as Constants from '../../util/constants';

@Injectable()
export class NetworkService {

  public get connectionStatus(): boolean {
    if (this.network.type === 'none' || !this.network.type) {
      return false;
    }
    return true;
  }

  public static firstConnect: boolean = true;
  constructor(private readonly network: Network,
    private readonly popoversService: PopoversService,
    private readonly reloadService: ReloadService,
    private readonly errorScheduler: ErrorScheduler) { }

  public listenForNetworkEvents(): void {
    if (!this.connectionStatus) {
      NetworkService.firstConnect = false;
      this.openNetworkModal();
    }

    this.network.onchange().distinctUntilKeyChanged('type').subscribe(state => {
      if (state.type === 'offline') {
        this.openNetworkModal();
      } else {
        this.popoversService.closeModal(Constants.POPOVER_NETWORK_OFFLINE);
        this.reloadService.announceRetry(true);
      }
    });

  }

  public openNetworkModal(): void {
    if (this.connectionStatus) {
      this.reloadService.announceRetry(true);
      return;
    }

    this.errorScheduler.showNetworkError().then(res => {
      if (res.optionSelected === 'OK') {
        this.openNetworkModal();
      }
    });
  }


}
