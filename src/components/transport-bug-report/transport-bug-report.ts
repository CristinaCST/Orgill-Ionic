import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportFormData } from '../../interfaces/models/route-tracking';
import { RouteTrackingProvider } from '../../providers/route-tracking/route-tracking';
import { LoadingService } from '../../services/loading/loading';
import { PopoverContent, PopoversService } from '../../services/popovers/popovers';
import { TranslateWrapperService } from '../../services/translate/translate';
import { GENERIC_MODAL_TITLE, MODAL_BUTTON_OK, loading_text } from '../../util/strings';
import { POPOVER_INFO } from '../../util/constants';

@Component({
  selector: 'transport-bug-report',
  templateUrl: 'transport-bug-report.html',
  styles: ['transport-bug-report.scss']
})
export class TransportBugReport implements OnInit {
  @Input() isHidden: boolean = false;

  public reportForm: FormGroup;
  public model: any = {};
  public isReportFormActive = false;
  private readonly loader: LoadingService;

  public issueTypes = [
    'You do not have any deliveries for today.',
    'The truck has already visited your location.',
    'Driver has not started the trip yet.',
    'Locating error, something went wrong. Please try again later.',
    'Directions error, something went wrong. Please try again later.',
    'Other'
  ];

  constructor(
    private readonly routeTrackingProvider: RouteTrackingProvider,
    private readonly formBuilder: FormBuilder,
    private readonly loadingService: LoadingService,
    private readonly popoversService: PopoversService,
    private readonly translateProvider: TranslateWrapperService
  ) {
    this.loader = loadingService.createLoader(translateProvider.translate(loading_text));
  }

  public ngOnInit(): void {
    this.reportForm = this.formBuilder.group({
      comments: this.model.comments,
      email: [this.model.email, [Validators.required, Validators.email]],
      errorDate: [this.model.errorDate, Validators.required],
      errorType: [this.model.errorType, Validators.required],
      shipToNumber: this.model.shipToNumber
    });
  }

  public openReportForm() {
    this.isReportFormActive = true;
  }

  public closeReportForm() {
    this.isReportFormActive = false;
  }

  public handleOnSubmit(formData: ReportFormData) {
    const currentTime = new Date();
    const errorDate = new Date(formData.errorDate);
    errorDate.setHours(
      currentTime.getHours(),
      currentTime.getMinutes(),
      currentTime.getSeconds(),
      currentTime.getMilliseconds()
    );
    formData.errorDate = errorDate.toISOString();

    this.loader.show();

    this.routeTrackingProvider.sendBugReport(formData).subscribe(response => {
      this.loader.hide();

      const content: PopoverContent = {
        type: POPOVER_INFO,
        title: GENERIC_MODAL_TITLE,
        message: response.message,
        positiveButtonText: MODAL_BUTTON_OK
      };
      this.popoversService.show(content);

      if (response.data && response.data.success) {
        this.clearReportForm();
        this.closeReportForm();
      }
    });
  }

  private clearReportForm() {
    Object.keys(this.reportForm.controls).forEach(key => {
      this.reportForm.controls[key].setValue(null);
    });
  }
}
