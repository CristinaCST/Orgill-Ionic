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

@Component({
  selector: 'page-route-tracking',
  templateUrl: 'route-tracking.html'
})
export class RouteTrackingPage {
  @ViewChild('Map') private readonly mapElement: ElementRef;
  @ViewChild('customInput') private readonly customInput: ElementRef;
  private readonly deliveryLoader: LoadingService;
  private currentMapIndex: number;

  // All locations
  private allCustomerLocations: any[] = [];

  // Search properties
  public searchQuery: string = '';
  public minSearchLength: number = 2;
  public currentPage: number = 1;
  public locationsPerPage: number = 5;
  public totalPages: number = 1;
  public isLoadingPage: boolean = false;

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
      if (!customerLocations.length) {
        this.deliveryLoader.hide();
        return;
      }

      this.allCustomerLocations = customerLocations;
      this.updatePagination();

      // Load the first page
      this.loadLocationPage(1);
    });
  }

  private updatePagination() {
    // If filtering by search, use filtered locations to calculate pages
    const locationsToUse = this.searchQuery && this.searchQuery.length >= this.minSearchLength
      ? this.allCustomerLocations.filter(loc =>
        loc.shipToNo.toLowerCase().includes(this.searchQuery.toLowerCase()))
      : this.allCustomerLocations;

    this.totalPages = Math.ceil(locationsToUse.length / this.locationsPerPage);
    this.totalPages = this.totalPages === 0 ? 1 : this.totalPages; // At least one page
  }

  public loadLocationPage(page: number) {
    this.currentPage = page;
    this.currentDeliveries = [];
    this.isLoadingPage = true;

    // Get locations - either filtered by search or all
    let locationsToUse = this.allCustomerLocations;

    if (this.searchQuery && this.searchQuery.length >= this.minSearchLength) {
      locationsToUse = this.allCustomerLocations.filter(loc =>
        loc.shipToNo.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    const startIndex = (page - 1) * this.locationsPerPage;
    const endIndex = Math.min(startIndex + this.locationsPerPage, locationsToUse.length);

    // Get subset of locations for current page
    const pageLocations = locationsToUse.slice(startIndex, endIndex);

    // Show loader
    this.deliveryLoader.show();

    // Process each location for the current page
    let processedCount = 0;

    if (pageLocations.length === 0) {
      this.isLoadingPage = false;
      this.deliveryLoader.hide();
      return;
    }

    pageLocations.forEach(customerLocation => {
      this.fetchCurrentRoute(customerLocation, false, () => {
        processedCount++;
        // Hide loader when all locations are processed
        if (processedCount === pageLocations.length) {
          this.isLoadingPage = false;
          this.deliveryLoader.hide();
        }
      });
    });
  }

  public nextPage() {
    if (this.currentPage < this.totalPages) {
      this.loadLocationPage(this.currentPage + 1);
    }
  }

  public prevPage() {
    if (this.currentPage > 1) {
      this.loadLocationPage(this.currentPage - 1);
    }
  }

  private fetchCurrentRoute(customerLocation: { shipToNo: string }, refreshMap?: boolean, onComplete?: () => void): void {
    // We don't need to show additional loader since we're using the main one
    this.routeTrackingProvider.getStoreRouteAndStops(customerLocation.shipToNo).subscribe({
      next: (routesAndStops): void => {
        this.updateDeliveriesList(customerLocation, routesAndStops, refreshMap);
        if (onComplete) {
          onComplete();
        }
      },
      error: (error) => {
        console.error('Error fetching route:', error);
        if (onComplete) {
          onComplete();
        }
      }
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
    }, 0);
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

  public executeSearch(): void {
    if (this.searchQuery.length >= this.minSearchLength) {
      this.updatePagination();
      this.loadLocationPage(1); // Reset to first page with new search results
    }
  }

  public clearSearch(): void {
    this.searchQuery = '';
    this.updatePagination();
    this.loadLocationPage(1);
  }

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
      this.allCustomerLocations = [locations];
      this.totalPages = 1;
      this.currentPage = 1;

      this.fetchCurrentRoute(locations);
      this.requestUnderway = false;
    });
  }
}
