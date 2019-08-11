import { Injectable } from '@angular/core';
import { PopoversService, PopoverContent, DefaultPopoverResult } from '../../services/popovers/popovers';
import * as Strings from '../../util/strings';
import * as Constants from '../../util/constants';
import { LoadingService } from '../../services/loading/loading';


// HACK: This entire error handler is a mess.

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
  private readonly waitBuffer: number = 300; // Time to wait for error events if we don't have top priority.
  private customContent: string;
  private waitTimeoutReference: number;
  public acceptNewErrors: boolean = true;
  private customAction: (arg: any) => void;

  constructor(private readonly popoversService: PopoversService) { }

  private beginWait(action: (arg: any) => void): void {
    if (action) {
      this.customAction = action;
    }

    if (this.waitTimeoutReference !== undefined) {
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
    switch (this.priority) {
      case ErrorPriority.networkError:
        content = this.popoversService.setContent(Strings.GENERIC_MODAL_TITLE, Strings.POPOVER_NETWORK_OFFLINE_MESSAGE, Strings.MODAL_BUTTON_TRY_AGAIN, undefined, undefined, Constants.POPOVER_NETWORK_OFFLINE);
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
    return this.popoversService.show(content).do(res => {
      this.acceptNewErrors = true;
      if (this.customAction) {
        this.customAction(res);
      }
    }).toPromise() as Promise<DefaultPopoverResult>;
  }

  public showNetworkError(): Promise<DefaultPopoverResult> {
    this.priority = ErrorPriority.networkError;
    this.customAction = undefined;
    return this.endWait();
  }

  public showRetryError(action?: (arg: any) => void): void {
    this.priority = ErrorPriority.retryError;
    this.beginWait(action);
  }

  public showCustomError(content: string, action?: (arg: any) => void): void {
    this.priority = ErrorPriority.customError;
    this.customContent = content;
    this.beginWait(action);
  }
}

