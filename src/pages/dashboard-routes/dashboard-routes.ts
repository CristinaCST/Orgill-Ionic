import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GoogleMapsProvider } from '../../providers/google-maps/google-maps';
import { DashboardProvider } from '../../providers/dashboard/dashboard';

@Component({
  selector: 'tab-page-dashboard-routes',
  templateUrl: 'dashboard-routes.html'
})
export class DashboardRoutes implements OnInit {
  @ViewChild('MapContainer') private readonly mapContainer: ElementRef;

  public dcOptions: any = ['Loading'];
  public routeOptions: any = ['Select DC first'];
  public currentOptions: any;
  public currentDcIndex: number = 0;
  public currentDc: any = 0;
  public currentRoute: any = 0;

  public customersFound: number = 0;
  public deliveriesFound: number = 0;

  public locations: any;

  public showMap: boolean = false;
  public showDetailsTable: boolean = false;
  public isLoading: boolean = false;

  constructor(
    private readonly dashboardProvider: DashboardProvider,
    private readonly mapInstance: GoogleMapsProvider
  ) {}

  public ngOnInit(): void {
    this.fetchDcAndRoutes();
  }

  public handleDcSelect(id: number): void {
    if (!id) {
      return;
    }

    this.currentDc = this.currentOptions[id - 1].dc;
    this.currentDcIndex = id - 1;
    this.routeOptions = ['Select Route', ...this.currentOptions[id - 1].routes];
    this.currentRoute = 0;
    this.showMap = false;
  }

  public handleRouteSelect(id: number): void {
    if (!id) {
      return;
    }

    this.currentRoute = this.currentOptions[this.currentDcIndex].routes[id - 1];
    this.showMap = false;
    this.isLoading = true;

    this.dashboardProvider
      .getCustomersByDcAndRoute({
        dc: this.currentOptions[this.currentDcIndex].dc,
        route: this.currentOptions[this.currentDcIndex].routes[id - 1]
      })
      .subscribe(locations => {
        this.initMap(locations);

        this.customersFound = locations.length;
        this.deliveriesFound = locations.reduce((acc, val) => (acc += val.deliveries), 0);

        this.locations = locations;

        this.isLoading = false;
      });
  }

  public toggleDetailsTable(state: boolean): void {
    this.showDetailsTable = state;
  }

  private fetchDcAndRoutes(): void {
    this.dashboardProvider.getDcAndRoutes().subscribe(response => {
      this.updateOptions(response);
    });
  }

  private updateOptions(data: any): void {
    this.currentOptions = data;

    this.dcOptions = ['Select DC', ...data.map(option => option.dc)];
  }

  private initMap(locations: any): void {
    const [center] = locations;

    this.mapInstance.removeMapMarkers(0, true);

    this.mapInstance
      .initMap(this.mapContainer.nativeElement, {
        disableDefaultUI: true,
        zoom: 10
      })
      .then(() => {
        this.showMap = true;

        this.mapInstance.updateMapOptions({ center: this.mapInstance.getLatLng(center.latitude, center.longitude) });

        locations.forEach(location => {
          this.mapInstance.addMapMarkers([this.mapInstance.getLatLng(location.latitude, location.longitude)], {
            icon: {
              url: '../../assets/imgs/icon-map.png',
              scaledSize: new google.maps.Size(60, 44),
              zIndex: 1
            }
          });
        });
      });
  }
}
