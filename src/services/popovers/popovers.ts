import { Injectable } from '@angular/core';
import { PopoverController, Popover } from 'ionic-angular';
import { PopoverComponent } from '../../components/popover/popover';
import * as Strings from '../../util/strings';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class PopoversService {

  // private close = new Subject<any>();
  private isOpened: boolean = false;
  private popover: Popover;
  public static activeItem: PopoversService;
  public static queue: any[] = [];

  constructor(private popoverController: PopoverController) {
  }

  /**
   *
   * @param content modal content, eg: type, title, message, buttons
   * @param continuous should the modal complete after 1 input? true if so
   * @param subjectReference pass a subject if you want a specific observable to be changed
   */
  public show(content, continuous = false, subjectReference = undefined) {
    if (this.isOpened === true) {
      const aux = new Subject<any>();
      aux.next(content);
      PopoversService.queue.push({ content, continuous, subject: aux });
      return aux.asObservable();
    }

    this.isOpened = true;

    PopoversService.activeItem = this;

    const close = subjectReference == undefined ? new Subject<any>() : subjectReference;

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

  private nextInQueue() {
    if (PopoversService.queue.length <= 0) {
      return;
    }

    const queueItem = PopoversService.queue.shift();
    this.show(queueItem.content, queueItem.continuous, queueItem.subject);
  }

  public closeModal() {
    if (this.isOpened === true) {
      PopoversService.activeItem = undefined;
      this.popover.dismiss();
      this.isOpened = false;
    }
  }

  public setContent(title, message, positiveButtonText = Strings.MODAL_BUTTON_YES,
                    dismissButtonText = undefined, negativeButtonText = undefined, type = undefined) {
    return {
      type,
      title,
      message,
      positiveButtonText,
      negativeButtonText,
      dismissButtonText
    };
  }

  public static dismissCurrent() {
    PopoversService.activeItem.closeModal();
  }
}
