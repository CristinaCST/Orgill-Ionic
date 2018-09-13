import {Injectable} from '@angular/core';
import {Popover, PopoverController} from "ionic-angular";
import {PopoverComponent} from "../../components/popover/popover";


@Injectable()
export class PopoversProvider {

  private popover: Popover;

  constructor(private popoverController: PopoverController) {
  }

  public show(content) {

    this.popover = this.popoverController.create(PopoverComponent,
      {
        'title': content.title,
        'message': content.message,
        'positiveButtonText': 'OK'
      },
      {'enableBackdropDismiss': false});

    if (this.popover) {
      this.popover.present().then(() => console.log('popover showed')).catch(err => console.error(err));
    }

    this.popover.onDidDismiss(data => {
      console.log(data);
    })
  }

}
