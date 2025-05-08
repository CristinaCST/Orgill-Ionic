import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { GoogleMapsProvider } from '../../providers/google-maps/google-maps';
import { MapDetails } from '../../interfaces/models/route-tracking';
import { RouteTrackingProvider } from '../../providers/route-tracking/route-tracking';
import { LoadingService } from '../../services/loading/loading';
import { PopoversService, PopoverContent } from '../../services/popovers/popovers';
import { TranslateWrapperService } from '../../services/translate/translate';
import { GENERIC_MODAL_TITLE, MODAL_BUTTON_OK, TRACK_ORDER_LOADER_TEXT } from '../../util/strings';
import { POPOVER_INFO } from '../../util/constants';

@Component({
  selector: 'page-map-details',
  templateUrl: 'map-details.html'
})
export class MapDetailsPage {
  @ViewChild('Map') private readonly mapElement: ElementRef;
  private readonly deliveryLoader: LoadingService;

  public showMoreInfo: boolean = false;
  public shipToNo: string;
  public customerData: any;

  public mapDetails: MapDetails = {
    distance: '',
    eta: '',
    customerName: '',
    shipToNo: '',
    truckId: '',
    invoices: []
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private readonly mapInstance: GoogleMapsProvider,
    private readonly routeTrackingProvider: RouteTrackingProvider,
    private readonly loadingService: LoadingService,
    private readonly translateProvider: TranslateWrapperService,
    private readonly popoversService: PopoversService,
    private readonly platform: Platform
  ) {
    this.deliveryLoader = loadingService.createLoader(this.translateProvider.translate(TRACK_ORDER_LOADER_TEXT));

    // Get passed data
    this.customerData = this.navParams.get('customerData');
    this.shipToNo = this.customerData.customerLocation.shipToNo;

    // Handle back button
    this.platform.registerBackButtonAction(() => {
      this.navCtrl.pop();
    });
  }

  ionViewDidLoad() {
    // Initialize the map when view loads
    this.initializeMap();
  }

  private initializeMap() {
    setTimeout(() => {
      this.populateMapWindow(this.customerData);
    }, 0);
  }

  public refreshMap(): void {
    this.showMoreInfo = false;
    this.fetchCurrentRoute();
  }

  private fetchCurrentRoute(): void {
    this.deliveryLoader.show();

    this.routeTrackingProvider.getStoreRouteAndStops(this.shipToNo).subscribe({
      next: (routesAndStops): void => {
        // Check for errors first
        if (routesAndStops.data && routesAndStops.data.error) {
          this.handleError(routesAndStops.data.error);
          return;
        } else if (routesAndStops.status && routesAndStops.status !== 'SUCCESS') {
          // Handle various error types
          this.handleStatusError(routesAndStops.status, routesAndStops.message);
          return;
        }

        // Update customer data and populate map
        this.customerData = {
          customerLocation: this.customerData.customerLocation,
          ...routesAndStops
        };
        this.populateMapWindow(this.customerData);
        this.deliveryLoader.hide();
      },
      error: (error) => {
        console.error('Error fetching route:', error);
        this.handleError('Unable to fetch delivery information. Please try again later.');
      }
    });
  }

  private handleError(errorMessage: string) {
    this.deliveryLoader.hide();
    const content: PopoverContent = {
      type: POPOVER_INFO,
      title: GENERIC_MODAL_TITLE,
      message: errorMessage,
      positiveButtonText: MODAL_BUTTON_OK
    };
    this.popoversService.show(content);
    this.navCtrl.pop(); // Go back to previous page after showing error
  }

  private handleStatusError(status: string, defaultMessage: string) {
    let errorMessage: string;

    switch (status) {
      case 'NO_DELIVERIES_FOUND':
        errorMessage = 'No deliveries found for this location today.';
        break;
      case 'NOT_STARTED_TRIP':
        errorMessage = 'The truck has not started its trip yet.';
        break;
      case 'LOCATING_ERROR':
        errorMessage = 'There was an error locating the truck.';
        break;
      case 'DIRECTIONS_ERROR':
        errorMessage = 'There was an error getting directions to your location.';
        break;
      case 'ALREADY_VISITED':
        errorMessage = 'The truck has already visited your location.';
        break;
      case 'NO_SHIP_TO_FOUND':
        errorMessage = 'No shipping information found for this location.';
        break;
      default:
        errorMessage = defaultMessage || 'An error occurred while tracking the delivery.';
    }

    this.handleError(errorMessage);
  }

  private populateMapWindow(data: any): void {
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

  public toggleMoreInfo(): void {
    this.showMoreInfo = !this.showMoreInfo;
  }
}
