import { Injectable } from '@angular/core';
import { PopoverController, Popover } from 'ionic-angular';
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
}

export interface DefaultPopoverResult {
  optionSelected?: string;
}

export interface CustomListPopoverResult {
  listName?: string;
  type?: string;
  listDescription?: string;
  optionSelected: string;
}

interface QueueItem {
  content: PopoverContent;
  continuous: boolean;
  subject: Subject<any>;
}

@Injectable()
export class PopoversService {

  // private close = new Subject<any>();
  private isOpened: boolean = false;
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
  public show(content: PopoverContent, continuous: boolean = false, subjectReference?: Subject<any>): Observable<DefaultPopoverResult | CustomListPopoverResult> {
    if (this.isOpened) {
      const aux: Subject<any> = new Subject<any>();
      aux.next(content);
      PopoversService.queue.push({ content, continuous, subject: aux } as QueueItem);
      return aux.asObservable();
    }

    this.isOpened = true;

    PopoversService.activeItem = this;

    const close: Subject<any> = subjectReference == undefined ? new Subject<any>() : subjectReference;

    this.popover = this.popoverController.create(PopoverComponent, content);

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
    this.show(queueItem.content, queueItem.continuous, queueItem.subject);
  }

  public closeModal(): void {
    if (this.isOpened) {
      PopoversService.activeItem = undefined;
      this.popover.dismiss();
      this.isOpened = false;
    }
  }

  public setContent(title: string = Strings.GENERIC_MODAL_TITLE, message: string, positiveButtonText: string = Strings.MODAL_BUTTON_OK,
    dismissButtonText?: string, negativeButtonText?: string, type?: string): PopoverContent {
    return {
      type,
      title,
      message,
      positiveButtonText,
      negativeButtonText,
      dismissButtonText
    };
  }

  public static dismissCurrent(): void {
    PopoversService.activeItem.closeModal();
  }
}
