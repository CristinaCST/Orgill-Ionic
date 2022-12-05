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
  public isInvalidNumber: boolean = false;
  public isUsernamesLoading: boolean = false;
  public minDatePickerValue: string = moment().add(1, 'day').format('YYYY-MM-DD');

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dropshipService: DropshipService,
    private readonly dropshipProvider: DropshipProvider,
    private readonly navigatorService: NavigatorService
  ) {}

  public ngOnInit(): void {
    this.customerInfoForm = this.formBuilder.group({
      customer_number: [this.model.customer_number, [Validators.required, Validators.pattern(new RegExp('^\\d+$'))]],
      selected_user: [this.model.selected_user, Validators.required],
      first_name: [this.model.first_name, Validators.required],
      last_name: [this.model.last_name, Validators.required],
      email: [this.model.email, [Validators.required, Validators.email]],
      phone: [this.model.phone, [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
      ship_date: [this.model.ship_date, Validators.required],
      po_number: this.model.po_number
    });

    this.formControls = this.customerInfoForm.controls;

    // HACK
    // stupid fix for https://orgill.atlassian.net/browse/OZONEAPP-109
    // project is too ancient and the documentation doesn't help...
    this.navigatorService.oneTimeBackButtonOverride(() => {
      const pickerBtn: Element = document.getElementsByClassName('picker-toolbar-cancel')[0];

      if (pickerBtn) {
        pickerBtn.getElementsByTagName('button')[0].dispatchEvent(new Event('click'));
      }

      this.navigatorService.pop();
    });
  }

  public handleCustomerNumber(customer_number: string): void {
    if (!this.formControls.customer_number.errors) {
      this.isUsernamesLoading = true;

      this.dropshipProvider.getUsernames(customer_number).subscribe((response: any) => {
        const usernames: VendorUserName[] = response;
        this.usernames = usernames;
        this.isInvalidNumber = !Boolean(usernames.length);
        this.isUsernamesLoading = false;
      });
    }
  }

  public handleCustomerNumberChange(): void {
    this.usernames = [];
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

    this.dropshipService.updateCustomerInfoForm(this.formatDate(this.customerInfoForm.value));
    this.navigatorService.push(SelectSpecialsPage);
  }

  private formatDate(data: any): any {
    return { ...data, ship_date: moment(data.ship_date).format('MM/DD/YYYY') };
  }
}
