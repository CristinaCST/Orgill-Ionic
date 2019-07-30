import { Injectable } from '@angular/core';
import { PopoversService, PopoverContent, DefaultPopoverResult } from '../../services/popovers/popovers';
import { Events } from 'ionic-angular';
import * as Strings from '../../util/strings';
import { Observable } from 'rxjs';
import { LoadingService } from '../../services/loading/loading';


// Main type of errors, in the order of priority.
enum ErrorPriority {
  networkError,
  retryError,
  customError,
  genericError
}

@Injectable()
export class ErrorScheduler {
  private priority: ErrorPriority;
  private waitBuffer: number = 300; // Time to wait for error events if we don't have top priority.
  private customContent: string;
  private waitTimeoutReference: number;
  private acceptNewErrors: boolean = true;
  private customAction: (any) => void;

  constructor(private readonly popoversService: PopoversService, private readonly events: Events) { }

  public async handleError(error: any): Promise<void> {
    console.error('Custom error ', error);

    let errorString: string = Strings.SOMETHING_WENT_WRONG;
  }

  private beginWait(action: (any) => void): void {
    if (action) {
      this.customAction = action;
    }

    if (this.waitTimeoutReference) {
      return;
    }


  

    this.waitTimeoutReference = setTimeout(() => {
      this.endWait();
    }, this.waitBuffer);

  }

  private endWait(): Promise<DefaultPopoverResult> {
    LoadingService.hideAll();
    this.acceptNewErrors = false;
    clearTimeout(this.waitTimeoutReference);
    this.waitTimeoutReference = undefined;
    let content: PopoverContent;
    console.log("priority: " + this.priority);
    switch (this.priority) {
      case ErrorPriority.networkError:
        content = this.popoversService.setContent(Strings.GENERIC_MODAL_TITLE, Strings.POPOVER_NETWORK_OFFLINE_MESSAGE, Strings.MODAL_BUTTON_TRY_AGAIN);
        break;
      case ErrorPriority.retryError:
        content = this.popoversService.setContent(Strings.GENERIC_MODAL_TITLE, Strings.RELOAD_ERROR_MESSAGE_WITHOUT_CULPRIT, Strings.MODAL_BUTTON_TRY_AGAIN);
        break;
      case ErrorPriority.customError:
        content = this.popoversService.setContent(Strings.GENERIC_MODAL_TITLE, this.customContent ? this.customContent : Strings.GENERIC_ERROR);
        break;
      default:
        content = this.popoversService.setContent(Strings.GENERIC_MODAL_TITLE, Strings.GENERIC_ERROR);
        break;
    }

    LoadingService.hideAll();
    return this.popoversService.show(content).do((res) => {
      this.acceptNewErrors = true;
      if (this.customAction) {
        this.customAction(res);
      }
    }).toPromise() as Promise<DefaultPopoverResult>;
  }

  public showNetworkError(): Promise<DefaultPopoverResult> {
    this.priority = ErrorPriority.networkError;
    return this.endWait();
  }

  public showRetryError(action?: (any) => void): void {
    this.priority = ErrorPriority.retryError;
    this.customAction = action;
    this.beginWait(action);
  }

  public showCustomError(content: string, action?: (any) => void): void {
    this.priority = ErrorPriority.customError;
    this.customContent = content;
    this.beginWait(action);
  }
}

