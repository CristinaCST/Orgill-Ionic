import { Component } from '@angular/core';
import { SpecialsPage } from '../ds-specials/specials';
import {
  DS_FORM_LIST_FORM_TYPE_DROPSHIP,
  DS_FORM_LIST_FORM_TYPE_PALLET,
  DS_FORM_LIST_FORM_TYPE_POG
} from '../../util/constants';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-select-specials',
  templateUrl: 'select-specials.html'
})
export class SelectSpecialsPage {
  public DROPSHIP: string = DS_FORM_LIST_FORM_TYPE_DROPSHIP;
  public PALLET: string = DS_FORM_LIST_FORM_TYPE_PALLET;
  public POG: string = DS_FORM_LIST_FORM_TYPE_POG;

  constructor(public navController: NavController) {}

  public goToSpecialsPage(formtype: string): void {
    this.navController.push(SpecialsPage, { formtype });
  }
}
