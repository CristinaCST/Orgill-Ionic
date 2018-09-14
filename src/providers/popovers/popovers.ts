import {Injectable} from '@angular/core';
import {Popover, PopoverController} from "ionic-angular";
import {PopoverComponent} from "../../components/popover/popover";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Injectable()
export class PopoversProvider {

  private close = new BehaviorSubject<any>({});
  private popover: Popover;

  constructor(private popoverController: PopoverController) {
  }

  public show(content) {

    this.popover = this.popoverController.create(PopoverComponent, content, {'enableBackdropDismiss': false});

    if (this.popover) {
      this.popover.present().then(() => console.log('popover showed')).catch(err => console.error(err));
    }

    this.popover.onDidDismiss(data => this.close.next(data));
    return this.close.asObservable();
  }

}
