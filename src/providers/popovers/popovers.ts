import {Injectable} from '@angular/core';
import {PopoverController} from "ionic-angular";
import {PopoverComponent} from "../../components/popover/popover";
import * as Constants from "../../util/constants";
import {Subject} from "rxjs/Subject";

@Injectable()
export class PopoversProvider {

  private close = new Subject<any>();
  private isOpened = false;
  private popover;

  constructor(private popoverController: PopoverController) {
  }

  public show(content) {
    this.popover = this.popoverController.create(PopoverComponent, content);
    if (this.isOpened === false) {
      this.isOpened = true;
    }
    else {
      this.popover.dismiss(null).then(() => {
        this.popover.present().catch(err => console.error(err));
        this.isOpened = true;
      });
    }
    this.popover.onDidDismiss(data => {
      this.isOpened = false;
      this.close.next(data);
    });
    this.popover.present().catch(err => console.error(err));
    return this.close.asObservable();
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
