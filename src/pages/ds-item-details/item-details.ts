import { Component, OnInit } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { DS_FORM_LIST_FORM_TYPE_DROPSHIP } from '../../util/constants';
import { FormDetails, FormItems } from '../../interfaces/response-body/dropship';

@Component({
  selector: 'page-item-details',
  templateUrl: 'item-details.html'
})
export class ItemDetailsPage implements OnInit {
  public data: FormItems;
  public formDetails: FormDetails;
  public isDropship: boolean = false;
  public isOverlayActive: boolean = false;
  public pageTitle: string;

  constructor(private readonly navParams: NavParams) {}

  public ngOnInit(): void {
    this.data = this.navParams.get('data');

    this.formDetails = this.navParams.get('formDetails');
    this.isDropship = this.formDetails.form_type.toLowerCase() === DS_FORM_LIST_FORM_TYPE_DROPSHIP;
    this.pageTitle = this.data.description;
  }

  public toggleOverlay(): void {
    this.isOverlayActive = !this.isOverlayActive;
  }
}
