import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
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
  constructor(private readonly network: Network,
              private readonly popoversService: PopoversService,
              private readonly reloadService: ReloadService,
              private readonly errorScheduler: ErrorScheduler) {}

  public listenForNetworkEvents(): void {
    if (!this.connectionStatus) {
      NetworkService.firstConnect = false;
      this.openNetworkModal();
    }
    
    // this.network.onDisconnect().subscribe(() => {
    //   // Fix for iOS lazy update of network.type, android has no issue but this fix can only affect positively android (ensure variable is set) so it should remain on both platforms 
    //   setTimeout(() => {
    //     this.openNetworkModal();
    //   }, 100);
    // });

    this.network.onchange().distinctUntilKeyChanged('type').subscribe(state=>{
      if(state.type === 'offline'){
        this.openNetworkModal();
      }else{
        this.popoversService.closeModal();
        this.reloadService.announceRetry();
      }
    });

  }

  public openNetworkModal(): void {
    console.log('conn status' + this.connectionStatus);
    if (this.connectionStatus) {
      //ErrorScheduler.scheduledError = this;
      this.reloadService.announceRetry();
    //  ErrorScheduler.scheduledError = undefined;
      return;
    }

    console.log('showing status');
    this.errorScheduler.showNetworkError();

    // ErrorScheduler.scheduledError = this;

    // this.popoversService.show(content).subscribe(res => {
    //   ErrorScheduler.scheduledError = undefined;
    //   this.openNetworkModal();
    // });
  }

 
}
