import { Injectable } from '@angular/core';
import { PopoverController } from "ionic-angular";
import { PopoverComponent } from "../../components/popover/popover";
import * as Constants from "../../util/constants";
import { Subject } from "rxjs/Subject";
import { timestamp } from 'rxjs/operator/timestamp';

@Injectable()
export class PopoversProvider {

  //private close = new Subject<any>();
  private isOpened = false;
  private popover;
  private queue=[];

  constructor(private popoverController: PopoverController) {
  }

  public show(content, subjectReference=null) {
    if(this.isOpened===true)
    {
      let aux = new Subject<any>();
      aux.next(content); 
      this.queue.push({content,subject:aux});
      return aux.asObservable();
    }

    this.isOpened=true;

    let close; 
    if(subjectReference==null){
      close = new Subject<any>();
    }else
    {
      close = subjectReference;
    }
    console.log(close);

    this.popover = this.popoverController.create(PopoverComponent, content);

    this.popover.onDidDismiss(data => {
      this.isOpened = false;

      close.next(data);
      close.complete();

      this.nextInQueue();
    });
    this.popover.present().catch(err => console.error(err));
    if(subjectReference==null)
    {
      return close.asObservable();
    }

  }

  private nextInQueue() {
    if (this.queue.length <= 0) {
      return;
    }

    console.log(this.queue.length);

    let queueItem = this.queue.shift();
   this.show(queueItem.content,queueItem.subject);
  }

  public closeModal() {
    if (this.isOpened === true) {
      this.popover.dismiss();
      this.isOpened = false;
    }
  }

  public setContent(title, message, positiveButtonText = Constants.OK,
    dismissButtonText = undefined, negativeButtonText = undefined, type = undefined) {
    return {
      type: type,
      title: title,
      message: message,
      positiveButtonText: positiveButtonText,
      negativeButtonText: negativeButtonText,
      dismissButtonText: dismissButtonText
    };
  }
}
