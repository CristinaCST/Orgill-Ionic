import * as Strings from '../util/strings';
import * as Constants from '../util/constants';
import { PopoverContent, PopoversService } from '../services/popovers/popovers';

// TODO: Move rules to args or constants.
/**
 * Validates PONumber with max length and alphanumeric characters
 * @param POInput Post office number as string
 * @param popoverServiceReference Optional reference to a popoverSerivce reference for pop ups
 * @returns the validated PONumber as a string
 */
export function PONumberValidator(POInput: string, popoverServiceReference?: PopoversService): string {
  let POSTOFFICE: string = POInput;
  if (!POSTOFFICE) {
    return '';
  }

  if (POSTOFFICE.length > 15) {
    const content: PopoverContent = {
      type: Constants.POPOVER_INFO,
      title: Strings.GENERIC_MODAL_TITLE,
      message: Strings.PO_NUMBER_TOO_LONG,
      positiveButtonText: Strings.MODAL_BUTTON_OK
    };

    popoverServiceReference.show(content);
    POSTOFFICE = POSTOFFICE.substr(0, 15);
  }

  const initialLength: number = POSTOFFICE.length;
  // tslint:disable-next-line: no-empty-character-class
  POSTOFFICE = POSTOFFICE.replace(/[^a-z\d\-]+/giu, '');
  if (initialLength !== POSTOFFICE.length && popoverServiceReference !== undefined) {
    const content: PopoverContent = {
      type: Constants.POPOVER_INFO,
      title: Strings.GENERIC_MODAL_TITLE,
      message: Strings.PO_ALPHANUMERIC_WARNING,
      positiveButtonText: Strings.MODAL_BUTTON_OK
    };

    popoverServiceReference.show(content);
  }
  return POSTOFFICE;
}
