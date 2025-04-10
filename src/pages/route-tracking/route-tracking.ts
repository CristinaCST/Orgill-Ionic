import { Component, ViewChild, ElementRef } from '@angular/core';
import { LoadingService } from '../../services/loading/loading';
import { GoogleMapsProvider } from '../../providers/google-maps/google-maps';
import { RouteTrackingProvider } from '../../providers/route-tracking/route-tracking';
import { TranslateWrapperService } from '../../services/translate/translate';
import {
  GENERIC_MODAL_TITLE,
  MODAL_BUTTON_OK,
  TRACK_VALID_INPUT_VALUE,
  TRACK_ORDER_LOADER_TEXT
} from '../../util/strings';
import { MapDetails } from '../../interfaces/models/route-tracking';
import { LocalStorageHelper } from '../../helpers/local-storage';
import { USER, POPOVER_INFO } from '../../util/constants';
import { PopoversService, PopoverContent } from '../../services/popovers/popovers';
import { Platform } from 'ionic-angular/platform/platform';
import { NavigatorService } from '../../services/navigator/navigator';
import { UserType } from '../../interfaces/models/user-type';

/**
 * Generated class for the RouteTrackingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-route-tracking',
  templateUrl: 'route-tracking.html'
})
export class RouteTrackingPage {
  @ViewChild('Map') private readonly mapElement: ElementRef;
  @ViewChild('customInput') private readonly customInput: ElementRef;
  private readonly deliveryLoader: LoadingService;
  private currentMapIndex: number;
  public currentDeliveries: any[] = [];
  public filteredDeliveries: any[] = [];
  public showMap: boolean;
  public showMoreInfo: boolean;
  private requestUnderway: boolean;
  public showCustomInput: boolean;
  public errorMessage: string = 'You do not have any deliveries for today.';
  public customerNumValue: string;
  public isFilterActive: boolean;
  public mapDetails: MapDetails = {
    distance: '',
    eta: '',
    customerName: '',
    shipToNo: '',
    truckId: '',
    invoices: []
  };

  constructor(
    private readonly mapInstance: GoogleMapsProvider,
    public routeTrackingProvider: RouteTrackingProvider,
    public loadingService: LoadingService,
    private readonly translateProvider: TranslateWrapperService,
    private readonly popoversService: PopoversService,
    private readonly platform: Platform,
    private readonly navigatorService: NavigatorService
  ) {
    this.deliveryLoader = loadingService.createLoader(this.translateProvider.translate(TRACK_ORDER_LOADER_TEXT));

    this.platform.registerBackButtonAction(() => {
      if (this.showMap) {
        this.toggleMap();
      } else {
        this.navigatorService.pop();
      }
    });
  }

  public ngOnInit(): void {
    console.log("USER", JSON.parse(LocalStorageHelper.getFromLocalStorage(USER)));
    const user_type: UserType = JSON.parse(LocalStorageHelper.getFromLocalStorage(USER)).user_type;

    if ([UserType.sales, UserType.manager, UserType.bdm, UserType.employee].includes(user_type)) {
      this.showCustomInput = true;
      return;
    }

    this.fetchCustomerLocations();
  }

  private fetchCustomerLocations() {
    this.deliveryLoader.show();

    this.routeTrackingProvider.getCustomerLocations().subscribe(customerLocations => {
      customerLocations.forEach((customerLocation: any) => {
        // if (!customerLocation.hasDeliveriesToday) {
        //   this.deliveryLoader.hide();
        //   return;
        // }

        this.fetchCurrentRoute(customerLocation);
      });
    });
  }

  private fetchCurrentRoute(customerLocation: { shipToNo: string }, refreshMap?: boolean): void {
    this.routeTrackingProvider.getStoreRouteAndStops(customerLocation.shipToNo).subscribe((routesAndStops): void => {
      this.deliveryLoader.hide();

      //   if (routesAndStops.error) {
      //     this.errorMessage = routesAndStops.error;
      //   } else {
      this.updateDeliveriesList(customerLocation, routesAndStops, refreshMap);
      //   }
    });
  }

  public toggleMap(data?: any): void {
    this.showMap = !this.showMap;

    if (!this.showMap || !data) {
      this.showMoreInfo = false;
      this.currentMapIndex = -1;
      this.mapDetails = {
        distance: '',
        eta: '',
        customerName: '',
        shipToNo: '',
        truckId: '',
        invoices: []
      };
      return;
    }

    this.currentMapIndex = this.currentDeliveries.indexOf(data);

    setTimeout(() => {
      this.populateMapWindow(data);
      this.mapElement.nativeElement.scrollIntoView();
    }, 0); // this was shown as an example on the angular docs
  }

  public refreshMap(): void {
    if (this.currentMapIndex < 0) {
      return;
    }
    this.showMoreInfo = false;
    this.fetchCurrentRoute(this.currentDeliveries[this.currentMapIndex].customerLocation, true);
  }

  private populateMapWindow(data: any): any {
    this.mapInstance
      .initMap(this.mapElement.nativeElement, {
        disableDefaultUI: true,
        zoom: 10
      })
      .then(() => {
        this.mapInstance
          .setMapRoute(
            {
              location: this.mapInstance.getLatLng(data.truck.latitude, data.truck.longitude)
            },
            this.mapInstance.getLatLng(data.end.latitude, data.end.longitude),
            data.stops.map((stop: { latitude: number; longitude: number }) => ({
              location: this.mapInstance.getLatLng(stop.latitude, stop.longitude),
              stopover: true
            }))
          )
          .subscribe({
            next: info => {
              Object.assign(this.mapDetails, {
                distance: info.distance,
                eta: info.duration
              });
            }
          });
      });

    Object.assign(this.mapDetails, {
      customerName: data.customerName,
      shipToNo: data.customerLocation.shipToNo,
      truckId: data.customerLocation.customerNo,
      invoices: data.invoices
    });
  }

  private updateDeliveriesList(customerLocation: any, routesAndStops: any, refreshMap?: boolean): void {
    const data: any = {
      customerLocation,
      ...routesAndStops
    };

    if (refreshMap && this.currentMapIndex >= 0) {
      this.currentDeliveries[this.currentMapIndex] = data;
      this.populateMapWindow(data);
    } else {
      this.currentDeliveries.push(data);
    }
  }

  private validateInput(value: string): boolean {
    return Boolean(!isNaN(Number(value)) && value.length === 6);
  }

  public onCustomerNumValueChange(value) {
    if (isNaN(parseFloat(value))) {
      if (!this.customerNumValue) {
        this.cancelFilter();
      }
      return;
    }

    this.isFilterActive = true;
    this.filteredDeliveries = this.currentDeliveries.filter(el => el.customerLocation.shipToNo.startsWith(value));
  }

  public cancelFilter() {
    if (this.isFilterActive) {
      this.isFilterActive = false;
      this.customerNumValue = null;
      this.filteredDeliveries = [];
    }
  }

  /**
   * only for testing
   */
  public customMethod(): void {
    if (!this.customInput || !this.validateInput(this.customInput.nativeElement.value) || this.requestUnderway) {
      const content: PopoverContent = {
        type: POPOVER_INFO,
        title: GENERIC_MODAL_TITLE,
        message: TRACK_VALID_INPUT_VALUE,
        positiveButtonText: MODAL_BUTTON_OK
      };
      this.popoversService.show(content);
      return;
    }

    this.requestUnderway = true; // hack to prevent input spamming

    this.deliveryLoader.show();

    this.routeTrackingProvider.adminGetCustomerLocations(this.customInput.nativeElement.value).subscribe(locations => {
      this.currentDeliveries = [];

      this.fetchCurrentRoute(locations);
      //   locations.forEach(location => this.fetchCurrentRoute(location));

      this.requestUnderway = false;
    });
  }
}
