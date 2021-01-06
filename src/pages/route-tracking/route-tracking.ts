import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { LoadingService } from '../../services/loading/loading';
import { GoogleMapsProvider } from '../../providers/google-maps/google-maps';
import { RouteTrackingProvider } from '../../providers/route-tracking/route-tracking';
import { TranslateWrapperService } from '../../services/translate/translate';
import { TRACK_ORDER_LOADER_TEXT } from '../../util/strings';

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
  private readonly deliveryLoader: LoadingService;
  private currentMapIndex: number;
  public currentDeliveries: any[] = [];
  public showMap: boolean;
  public showMoreInfo: boolean;
  public mapDetails = {};

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
      customerLocations.forEach(customerLocation => {
        this.fetchCurrentRoute(customerLocation);
      });
    });
  }

  private fetchCurrentRoute(customerLocation, refreshMap?: boolean): void {
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
      this.mapDetails = {};
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
            data.stops.map(stop => ({
              location: this.mapInstance.getLatLng(stop.latitude, stop.longitude),
              stopover: true
            }))
          )
          .subscribe({
            next: data => {
              Object.assign(this.mapDetails, {
                distance: data.distance,
                eta: data.duration
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

  private updateDeliveriesList(customerLocation, routesAndStops, refreshMap?: boolean): void {
    const data = {
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
}
