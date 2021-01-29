import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { LoadingService } from '../../services/loading/loading';
import { GoogleMapsProvider } from '../../providers/google-maps/google-maps';
import { RouteTrackingProvider } from '../../providers/route-tracking/route-tracking';
import { TranslateWrapperService } from '../../services/translate/translate';
import { TRACK_ORDER_LOADER_TEXT } from '../../util/strings';
import { MapDetails } from '../../interfaces/models/route-tracking';
import { LocalStorageHelper } from '../../helpers/local-storage';
import { USER } from '../../util/constants';

/**
 * Generated class for the RouteTrackingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
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
  public showMap: boolean;
  public showMoreInfo: boolean;
  private requestUnderway: boolean;
  public showCustomInput: boolean;
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
    private readonly translateProvider: TranslateWrapperService
  ) {
    this.deliveryLoader = loadingService.createLoader(
      this.translateProvider.translate(TRACK_ORDER_LOADER_TEXT)
    );
  }

  public ngOnInit(): void {
    this.deliveryLoader.show();

    this.routeTrackingProvider.getCustomerLocations().subscribe(customerLocations => {
      customerLocations.forEach((customerLocation: any) => {
        this.fetchCurrentRoute(customerLocation);
      });
    });

    // amazing hardcoding skills
    const user: string = JSON.parse(LocalStorageHelper.getFromLocalStorage(USER)).user_name;
    if (['Liddyt1', 'Jbaranski', 'mickorr', 'csmh'].indexOf(user) >= 0) {
      this.showCustomInput = true;
    }
  }

  private fetchCurrentRoute(customerLocation: { shipToNo: string }, refreshMap?: boolean): void {
    this.routeTrackingProvider
      .getStoreRouteAndStops(customerLocation.shipToNo)
      .subscribe((routesAndStops): void => {
        this.deliveryLoader.hide();

        if (!routesAndStops.error) {
          this.updateDeliveriesList(customerLocation, routesAndStops, refreshMap);
        }
      });
  }

  public toggleMap(data: any): void {
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
    }, 0); // this was shown as an example on the angular docs
  }

  public refreshMao(): void {
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
            { location: this.mapInstance.getLatLng(data.truck.latitude, data.truck.longitude) },
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
      customerName: data.customerLocation.customerName,
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

  /**
   * only for testing
   */
  public customMethod(): void {
    if (!this.customInput && !this.customInput.nativeElement.value && this.requestUnderway) {
      return;
    }

    this.requestUnderway = true; // hack to prevent input spamming

    this.deliveryLoader.show();

    this.routeTrackingProvider
      .adminGetCustomerLocations(this.customInput.nativeElement.value)
      .subscribe(customerLocations => {
        customerLocations.forEach((customerLocation: any) => {
          this.fetchCurrentRoute(customerLocation);
        });

        this.requestUnderway = false;
      });
  }
}
