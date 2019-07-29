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

  constructor(private readonly popoversService: PopoversService, private readonly events: Events) {}

  public async handleError(error: any): Promise<void> {
    console.error('Custom error ', error);

    let errorString: string = Strings.SOMETHING_WENT_WRONG;
  }

  private beginWait(): void {
    if(this.waitTimeoutReference){
      return;
    }
  
    this.waitTimeoutReference = setTimeout(()=>{
      this.endWait();
    }, this.waitBuffer);

  }

  private endWait(): void {
    LoadingService.hideAll();
    this.acceptNewErrors = false;
    clearTimeout(this.waitTimeoutReference);
    this.waitTimeoutReference = undefined;
    let content: PopoverContent;
    switch (this.priority) {
      case ErrorPriority.networkError:
        content = this.popoversService.setContent(Strings.GENERIC_MODAL_TITLE, Strings.POPOVER_TIMEOUT_ERROR_MESSAGE);
        break;
      case ErrorPriority.retryError:
        content = this.popoversService.setContent(Strings.GENERIC_MODAL_TITLE, Strings.RELOAD_ERROR_MESSAGE_WITHOUT_CULPRIT, Strings.MODAL_BUTTON_TRY_AGAIN);
        break;
      case ErrorPriority.customError:
        content = this.popoversService.setContent(Strings.GENERIC_MODAL_TITLE , this.customContent?this.customContent:'BROKEN');
        break;
      default:
        content = this.popoversService.setContent(Strings.GENERIC_MODAL_TITLE, Strings.GENERIC_ERROR);
        break;
    }
    this.showErrorModal(content).subscribe(res=>{
      this.acceptNewErrors = true;
     // LoadingService.hideAll();
    });
  }

  public showNetworkError(): void {
    this.priority = ErrorPriority.networkError;
    this.endWait();
  }

  public showRetryError(): void {
    this.priority = ErrorPriority.retryError;
    this.beginWait();
  }

  public showCustomError(content: string): void {
    this.priority = ErrorPriority.customError;
    this.customContent = content;
    this.beginWait();
  }

  private showErrorModal(content: PopoverContent): Observable<DefaultPopoverResult> {
    LoadingService.hideAll();
    return this.popoversService.show(content);
  }
  }

