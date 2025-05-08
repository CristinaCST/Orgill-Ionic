import { Component, ViewChild, ElementRef } from '@angular/core';
import { LoadingService } from '../../services/loading/loading';
import { RouteTrackingProvider } from '../../providers/route-tracking/route-tracking';
import { TranslateWrapperService } from '../../services/translate/translate';
import {
  GENERIC_MODAL_TITLE,
  MODAL_BUTTON_OK,
  TRACK_VALID_INPUT_VALUE,
  TRACK_ORDER_LOADER_TEXT
} from '../../util/strings';
import { LocalStorageHelper } from '../../helpers/local-storage';
import { USER, POPOVER_INFO } from '../../util/constants';
import { PopoversService, PopoverContent } from '../../services/popovers/popovers';
import { Platform } from 'ionic-angular/platform/platform';
import { NavigatorService } from '../../services/navigator/navigator';
import { UserType } from '../../interfaces/models/user-type';
import {MapDetailsPage} from "../../components/map-details/map-details";

@Component({
  selector: 'page-route-tracking',
  templateUrl: 'route-tracking.html'
})
export class RouteTrackingPage {
  @ViewChild('customInput') private readonly customInput: ElementRef;
  private readonly deliveryLoader: LoadingService;

  // All locations
  private allCustomerLocations: any[] = [];

  // Search properties
  public searchQuery: string = '';
  public minSearchLength: number = 2;
  public currentPage: number = 1;
  public locationsPerPage: number = 10;
  public totalPages: number = 1;
  public isLoadingPage: boolean = false;

  public currentDeliveries: any[] = [];
  public filteredDeliveries: any[] = [];
  public showCustomInput: boolean;
  private requestUnderway: boolean;
  public errorMessage: string = 'You do not have any deliveries for today.';
  public customerNumValue: string;
  public isFilterActive: boolean;

  constructor(
    public routeTrackingProvider: RouteTrackingProvider,
    public loadingService: LoadingService,
    private readonly translateProvider: TranslateWrapperService,
    private readonly popoversService: PopoversService,
    private readonly platform: Platform,
    private readonly navigatorService: NavigatorService
  ) {
    this.deliveryLoader = loadingService.createLoader(this.translateProvider.translate(TRACK_ORDER_LOADER_TEXT));

    this.platform.registerBackButtonAction(() => {
      this.navigatorService.pop();
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
      this.fetchCurrentRoute(customerLocation, () => {
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

  private fetchCurrentRoute(customerLocation: { shipToNo: string }, onComplete?: () => void): void {
    // We don't need to show additional loader since we're using the main one
    this.routeTrackingProvider.getStoreRouteAndStops(customerLocation.shipToNo).subscribe({
      next: (routesAndStops): void => {
        this.updateDeliveriesList(customerLocation, routesAndStops);
        if (onComplete) {
          onComplete();
        }
      },
      error: (error) => {
        console.error('Error fetching route:', error);

        // Create a delivery entry with error message
        const errorData = {
          customerLocation,
          error: 'Unable to fetch delivery information. Please try again later.'
        };

        this.currentDeliveries.push(errorData);

        if (onComplete) {
          onComplete();
        }
      }
    });
  }

  public toggleMap(data?: any): void {
    // If data contains an error, show popup instead of opening map
    if (data && data.error) {
      const content: PopoverContent = {
        type: POPOVER_INFO,
        title: GENERIC_MODAL_TITLE,
        message: data.error,
        positiveButtonText: MODAL_BUTTON_OK
      };
      this.popoversService.show(content);
      return;
    }

    // Navigate to the map details page with the necessary data
    this.navigatorService.push(MapDetailsPage, {
      customerData: data
    });
  }

  private updateDeliveriesList(customerLocation: any, routesAndStops: any): void {
    // Handle potential error response
    let data: any = {
      customerLocation,
      ...routesAndStops
    };

    // If the response contains an error message, make sure it's included
    if (routesAndStops.data && routesAndStops.data.error) {
      data = {
        customerLocation,
        ...routesAndStops.data
      };
    } else if (routesAndStops.status && routesAndStops.status !== 'SUCCESS') {
      // Handle various error types
      switch (routesAndStops.status) {
        case 'NO_DELIVERIES_FOUND':
          data.error = 'No deliveries found for this location today.';
          break;
        case 'NOT_STARTED_TRIP':
          data.error = 'The truck has not started its trip yet.';
          break;
        case 'LOCATING_ERROR':
          data.error = 'There was an error locating the truck.';
          break;
        case 'DIRECTIONS_ERROR':
          data.error = 'There was an error getting directions to your location.';
          break;
        case 'ALREADY_VISITED':
          data.error = 'The truck has already visited your location.';
          break;
        case 'NO_SHIP_TO_FOUND':
          data.error = 'No shipping information found for this location.';
          break;
        default:
          data.error = routesAndStops.message || 'An error occurred while tracking the delivery.';
      }
    }

    this.currentDeliveries.push(data);
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
