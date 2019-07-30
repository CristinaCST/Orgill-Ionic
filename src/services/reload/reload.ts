 // TODO: re-enable linting after fixing this
    // tslint:disable

import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { LoadingService } from '../../services/loading/loading';
import { DefaultPopoverResult } from '../../services/popovers/popovers';
import * as Constants from '../../util/constants';
import { Observable } from 'rxjs/Observable';
import { ErrorScheduler } from '../../services/error-scheduler/error-scheduler';

@Injectable()
export class ReloadService {
    public loader: LoadingService;  // TODO: This should not be public, as other variables, need to fix all linters to correctly recognize unused situation.
    public dirty: boolean = false;
    public culprit: string;

    constructor(private readonly events: Events,
                private readonly loadingService: LoadingService,
                private readonly errorScheduler: ErrorScheduler) {
        this.loader = this.loadingService.createLoader();

        this.events.subscribe(Constants.EVENT_SERVER_ERROR, ()=>{
            this.errorScheduler.showRetryError((res:DefaultPopoverResult)=>{
                if(res.optionSelected === 'OK'){
                    this.announceRetry();
                }
            });
        });
    }

   
    // TODO: this should not work if we don't have network.
    // private showTryAgainModal(): Observable<DefaultPopoverResult> { 
    //     // if (ErrorScheduler.scheduledError === undefined) {
    //     //     ErrorScheduler.scheduledError = this;
    //     // } else {
    //     //     return Observable.of({});
    //     // }
    //     //
    //     //
    //     // const content: PopoverContent = this.popoversService.setContent(Strings.GENERIC_MODAL_TITLE, Strings.RELOAD_ERROR_MESSAGE_WITHOUT_CULPRIT, Strings.MODAL_BUTTON_TRY_AGAIN);
    //     // /*if(this.culprit !== ' '){
    //     //     const culprit: string = this.culprit;
    //     //     content.message = Strings.RELOAD_ERROR_MESSAGE_WITH_CULPRIT;
    //     // }*/
    //     // return this.popoversService.show(content);
    //   return Observable.of({});
    // }

    public paintDirty(target?: string): void {
        this.culprit = target;
        // if (this.dirty) {
        //     return;
        // }
        //
        // this.culprit = target ? target : '';
        //
        // this.dirty = true;
        // LoadingService.hideAll();
        // this.showTryAgainModal().subscribe(result => {
        //     this.announceRetry();
        //     this.dirty = false;
        //     this.culprit = '';
        //     ErrorScheduler.scheduledError = undefined;
        // }, e => {
        //     // Scheduled error
        // });
      return;
    }

    public announceRetry(all?: boolean): void {
        console.log('announcing retry with culprit', all?'':this.culprit);
        this.events.publish(Constants.EVENT_LOADING_FAILED,  all?'':this.culprit);
    }
}
