 // TODO: re-enable linting after fixing this
    // tslint:disable

import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { LoadingService } from '../../services/loading/loading';
import { /* PopoversService,  PopoverContent,*/ DefaultPopoverResult } from '../../services/popovers/popovers';
// import * as Strings from '../../util/strings';
import * as Constants from '../../util/constants';
// import { ErrorScheduler } from '../../services/error-scheduler/error-scheduler';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ReloadService {
    public loader: LoadingService;  // TODO: This should not be public, as other variables, need to fix all linters to correctly recognize unused situation.
    public dirty: boolean = false;
    public culprit: string;

    constructor(private readonly events: Events, private readonly loadingService: LoadingService /*, private readonly popoversService: PopoversService*/) {
        this.loader = this.loadingService.createLoader();
    }

   
    // TODO: this should not work if we don't have network.
    private showTryAgainModal(): Observable<DefaultPopoverResult> { 
        // if (ErrorScheduler.scheduledError === undefined) {
        //     ErrorScheduler.scheduledError = this;
        // } else {
        //     return Observable.of({});
        // }
        //
        //
        // const content: PopoverContent = this.popoversService.setContent(Strings.GENERIC_MODAL_TITLE, Strings.RELOAD_ERROR_MESSAGE_WITHOUT_CULPRIT, Strings.MODAL_BUTTON_TRY_AGAIN);
        // /*if(this.culprit !== ' '){
        //     const culprit: string = this.culprit;
        //     content.message = Strings.RELOAD_ERROR_MESSAGE_WITH_CULPRIT;
        // }*/
        // return this.popoversService.show(content);
      return Observable.of({});
    }

    public paintDirty(target?: string): void {
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

    public announceRetry(): void {
        this.events.publish(Constants.EVENT_LOADING_FAILED, this.culprit);
    }
}
