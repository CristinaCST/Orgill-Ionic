import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
import * as Strings from '../../util/strings';
import { PopoversService, PopoverContent } from '../popovers/popovers';
import { ReloadService } from '../../services/reload/reload';
import { ErrorScheduler } from '../../services/error-scheduler/error-scheduler';

@Injectable()
export class NetworkService {

  public get connectionStatus(): boolean {
    if (this.network.type === 'none' || !this.network.type) {
      return false;
    }
    return true;
  }

  public static firstConnect: boolean = true;
  constructor(private readonly network: Network, private readonly popoversService: PopoversService, private readonly reloadService: ReloadService) {}

  public listenForNetworkEvents(): void {
    if (!this.connectionStatus) {
      NetworkService.firstConnect = false;
      this.openNetworkModal();
    }
    
    this.network.onDisconnect().subscribe(() => {
      // Fix for iOS lazy update of network.type, android has no issue but this fix can only affect positively android (ensure variable is set) so it should remain on both platforms 
      setTimeout(() => {
        this.openNetworkModal();
      }, 500);
    });

    this.network.onConnect().subscribe(() => {
      this.popoversService.closeModal();
      this.reloadService.announceRetry();
      if (!NetworkService.firstConnect) {
        NetworkService.firstConnect = true;
      }
    });
  }

  public openNetworkModal(): void {
    if (this.connectionStatus) {
      //ErrorScheduler.scheduledError = this;
      this.reloadService.announceRetry();
    //  ErrorScheduler.scheduledError = undefined;
      return;
    }

    // ErrorScheduler.scheduledError = this;

    // this.popoversService.show(content).subscribe(res => {
    //   ErrorScheduler.scheduledError = undefined;
    //   this.openNetworkModal();
    // });
  }

 
}
