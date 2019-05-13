import { Injectable } from '@angular/core';
import { PopoverController } from "ionic-angular";
import { PopoverComponent } from "../../components/popover/popover";
import * as Strings from "../../util/strings";
import { Subject } from "rxjs/Subject";
import { timestamp } from 'rxjs/operator/timestamp';

@Injectable()
export class PopoversProvider {

  //private close = new Subject<any>();
  private isOpened = false;
  private popover;
  static activeItem;
  static queue = [];

  constructor(private popoverController: PopoverController) {
  }

  /**
   * 
   * @param content modal content, eg: type, title, message, buttons
   * @param continuous should the modal complete after 1 input? true if so
   * @param subjectReference pass a subject if you want a specific observable to be changed
   */
  public show(content, continuous = false, subjectReference = null) {
    if (this.isOpened === true) {
      let aux = new Subject<any>();
      aux.next(content);
      PopoversProvider.queue.push({ content, continuous, subject: aux});
      return aux.asObservable();
    }

    this.isOpened = true;

    
    PopoversProvider.activeItem=this;
    console.log("SETTING THIS POPOVER", PopoversProvider.activeItem);

    let close;
    if (subjectReference == null) {
      close = new Subject<any>();
    } else {
      close = subjectReference;
    }

    this.popover = this.popoverController.create(PopoverComponent, content);

    this.popover.onDidDismiss(data => {
      this.isOpened = false;

      if(!data){
        data = {optionSelected:"NO"}
      }

      close.next(data);

      if (!continuous) {
        close.complete();
      }
      this.nextInQueue();
    });
    this.popover.present().catch(err => console.error(err));
    if (subjectReference == null) {
      return close.asObservable();
    }

  }

  private nextInQueue() {
    if (PopoversProvider.queue.length <= 0) {
      return;
    }

    PopoversProvider.queue.length;

    let queueItem = PopoversProvider.queue.shift();
    this.show(queueItem.content, queueItem.continuous, queueItem.subject);
  }

  public closeModal() {
    if (this.isOpened === true) {
      console.log("Unsetting popover");
      PopoversProvider.activeItem=null;
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
      dismissButtonText,
    };
  }

  static dismissCurrent(){
    this.activeItem.closeModal();
  }
}
