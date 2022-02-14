import { Component, Input } from '@angular/core';
import { Events } from 'ionic-angular';
import { PopoverContent, PopoversService, DefaultPopoverResult } from '../../services/popovers/popovers';
import { DropshipProvider } from '../../providers/dropship/dropship';
import { LoadingService } from '../../services/loading/loading';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';
import { TranslateWrapperService } from '../../services/translate/translate';

@Component({
  selector: 'card',
  templateUrl: 'card.html'
})
export class CardComponent {
  @Input() public data: any;
  @Input() public isSaveDrafts: boolean;
  @Input() public isDropship: boolean;
  public popoverContent: PopoverContent = {
    type: Constants.POPOVER_INFO,
    title: Strings.GENERIC_MODAL_TITLE,
    message: Strings.dropship_confirm_delete_order,
    dismissButtonText: Strings.MODAL_BUTTON_CANCEL,
    positiveButtonText: Strings.MODAL_BUTTON_DELETE
  };
  private readonly dropshipLoader: LoadingService;

  constructor(
    private readonly dropshipProvider: DropshipProvider,
    private readonly popoversService: PopoversService,
    public events: Events,
    public loadingService: LoadingService,
    private readonly translateProvider: TranslateWrapperService
  ) {
    this.dropshipLoader = loadingService.createLoader(this.translateProvider.translate(Strings.loading_text));
  }

  public deleteCurrentOrder(e: Event): void {
    e.stopPropagation();

    this.popoversService.show(this.popoverContent).subscribe((response: DefaultPopoverResult) => {
      if (response.optionSelected === 'OK') {
        this.dropshipLoader.show();
        this.dropshipProvider.dsDeleteSavedorder({ order_id: this.data.order_id }).subscribe(() => {
          this.dropshipLoader.hide();

          Object.assign(this.popoverContent, {
            message: Strings.dropship_order_deleted,
            dismissButtonText: undefined,
            positiveButtonText: Strings.MODAL_BUTTON_OK
          });

          this.popoversService.show(this.popoverContent).subscribe((result: DefaultPopoverResult) => {
            if (result.optionSelected === 'OK') {
              this.events.publish('savedOrderDeleted', this.data.order_id);
            }
          });
        });
      }
    });
  }
}
