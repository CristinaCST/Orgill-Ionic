import {Injectable} from '@angular/core';
import {PopoverController} from "ionic-angular";
import {PopoverComponent} from "../../components/popover/popover";
import * as Constants from "../../util/constants";
import {Subject} from "rxjs/Subject";

@Injectable()
export class PopoversProvider {

  private close = new Subject<any>();
  private isOpened = false;

  constructor(private popoverController: PopoverController) {
  }

  public show(content) {
    let popover = this.popoverController.create(PopoverComponent, content);
    if (this.isOpened === false) {
      this.isOpened = true;
    }
    else {
      popover.dismiss(null).then(() => {
        popover.present().catch(err => console.error(err));
        this.isOpened = true;
      });
    }
    popover.onDidDismiss(data => {
      this.isOpened = false;
      this.close.next(data);
    });
    popover.present().catch(err => console.error(err));
    return this.close.asObservable();
  }

  public setContent(title, message, positiveButtonText = Constants.OK, dismissButtonText = undefined, type = undefined) {
    return {
      type: type,
      title: title,
      message: message,
      positiveButtonText: positiveButtonText,
      dismissButtonText: dismissButtonText
    };
  }
}
