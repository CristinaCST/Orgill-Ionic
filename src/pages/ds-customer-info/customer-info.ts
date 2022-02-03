import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DropshipService } from '../../services/dropship/dropship';
import { DropshipProvider } from '../../providers/dropship/dropship';
import { NavigatorService } from '../../services/navigator/navigator';
import { SelectSpecialsPage } from '../../pages/ds-select-specials/select-specials';
import { VendorUserName } from '../../interfaces/response-body/dropship';
import moment from 'moment';

@Component({
  selector: 'page-customer-info',
  templateUrl: 'customer-info.html'
})
export class CustomerInfoPage implements OnInit {
  public customerInfoForm: FormGroup;
  public model: any = {};
  public formControls: any;
  public usernames: VendorUserName[] = [];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dropshipService: DropshipService,
    private readonly dropshipProvider: DropshipProvider,
    private readonly navigatorService: NavigatorService
  ) {}

  public ngOnInit(): void {
    this.customerInfoForm = this.formBuilder.group({
      customer_number: [this.model.customer_number, [Validators.required, Validators.pattern(new RegExp('^\\d+$'))]],
      selected_user: this.model.selected_user,
      first_name: [this.model.first_name, Validators.required],
      last_name: [this.model.last_name, Validators.required],
      email: [this.model.email, [Validators.required, Validators.email]],
      phone: [this.model.phone, Validators.required],
      ship_date: [this.model.ship_date, Validators.required],
      po_number: this.model.po_number
    });

    this.formControls = this.customerInfoForm.controls;
  }

  public handleCustomerNumber(value: string): void {
    if (!this.formControls.customer_number.errors) {
      this.dropshipProvider.getUsernames({ customer_number: value }).subscribe(response => {
        this.usernames = JSON.parse(response.d);
      });
    }
  }

  public handleSelect(user: VendorUserName): void {
    this.formControls.email.setValue(user.email_address);
    const [firstName, lastName] = user.full_name.split(' ');
    this.formControls.first_name.setValue(firstName);
    this.formControls.last_name.setValue(lastName);
  }

  public saveForm(): void {
    if (!this.customerInfoForm.valid) {
      return;
    }

    const formData: any = this.formatDate(this.customerInfoForm.value);
    this.dropshipService.updateCustomerInfoForm(formData);
    this.navigatorService.push(SelectSpecialsPage);
  }

  private formatDate(data: any): any {
    return { ...data, ship_date: moment(data.ship_date).format('MM/DD/YYYY') };
  }
}
