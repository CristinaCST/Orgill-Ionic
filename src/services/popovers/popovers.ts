import { Injectable } from '@angular/core';
import { PopoverController, Popover, PopoverOptions } from 'ionic-angular';
import { PopoverComponent } from '../../components/popover/popover';
import * as Strings from '../../util/strings';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs';

// TODO: Move these outside

export interface PopoverContent{
  type?: string;
  title?: string;
  message?: string;
  positiveButtonText?: string;
  negativeButtonText?: string;
  dismissButtonText?: string;
  additionalData?: any;
}

export interface DefaultPopoverResult {
  optionSelected: string;
}

export interface CustomListPopoverResult extends DefaultPopoverResult {
  listName?: string;
  type?: string;
  listDescription?: string;
}

export interface QuantityPopoverResult extends DefaultPopoverResult {
  quantity: number;
}

export interface SupportPopoverResult extends DefaultPopoverResult {
  code: string;
}

interface QueueItem {
  content: PopoverContent;
  continuous: boolean;
  subject: Subject<any>;
  opts: PopoverOptions;
}

@Injectable()
export class PopoversService {

  // private close = new Subject<any>();
  private isOpened: boolean = false;
  public type: string = undefined;
  private popover: Popover;
  public static activeItem: PopoversService;
  public static queue: QueueItem[] = [];

  constructor(private readonly popoverController: PopoverController) {}
  
  /**
   *
   * @param content modal content, eg: type, title, message, buttons
   * @param continuous should the modal complete after 1 input? true if so
   * @param subjectReference pass a subject if you want a specific observable to be changed
   */
  public show(content: PopoverContent, continuous: boolean = false, opts?: PopoverOptions, subjectReference?: Subject<any>): Observable<DefaultPopoverResult | CustomListPopoverResult | QuantityPopoverResult | SupportPopoverResult> {
    if (this.isOpened) {
      const aux: Subject<any> = new Subject<any>();
      aux.next(content);
      PopoversService.queue.push({ content, continuous, subject: aux } as QueueItem);
      return aux.asObservable();
    }

    this.isOpened = true;

    PopoversService.activeItem = this;

    const close: Subject<any> = subjectReference == undefined ? new Subject<any>() : subjectReference;

    this.popover = this.popoverController.create(PopoverComponent, content, opts);

    this.popover.onDidDismiss(data => {
      this.isOpened = false;
      PopoversService.activeItem = undefined;
      if (!data) {
        data = { optionSelected: 'NO' };
      }

      close.next(data);

      if (!continuous) {
        close.complete();
      }
      this.nextInQueue();
    });
    this.type = content.type;
    this.popover.present().catch(err => console.error(err));
    if (subjectReference == undefined) {
      return close.asObservable();
    }

  }

  private nextInQueue(): void {
    if (PopoversService.queue.length <= 0) {
      return;
    }

    const queueItem: QueueItem = PopoversService.queue.shift();
    this.show(queueItem.content, queueItem.continuous, queueItem.opts, queueItem.subject);
  }

  public closeModal(popoverType?: string): void {
    if (popoverType !== undefined) {
      for (let i: number = PopoversService.queue.length - 1; i >= 0; i--) {
        if (PopoversService.queue[i].content.type === popoverType) {
          PopoversService.queue.splice(i, 1);
        }
      }
    }

    if (this.type !== popoverType) {
      return;
    }

    if (this.isOpened) {
      PopoversService.activeItem = undefined;
      this.popover.dismiss();
      this.isOpened = false;
    }
  }

  public setContent(title: string = Strings.GENERIC_MODAL_TITLE, message: string, positiveButtonText: string = Strings.MODAL_BUTTON_OK,
    dismissButtonText?: string, negativeButtonText?: string, type?: string, additionalData?: any): PopoverContent {
    return {
      type,
      title,
      message,
      positiveButtonText,
      negativeButtonText,
      dismissButtonText,
      additionalData
    };
  }

  public static dismissCurrent(): void {
    PopoversService.activeItem.closeModal();
  }
}
