import { Component, ElementRef, ViewChild } from '@angular/core';
import { Events } from 'ionic-angular';
import { GoogleMapsProvider } from '../../providers/google-maps/google-maps';
import { DashboardProvider } from '../../providers/dashboard/dashboard';

@Component({
  selector: 'tab-page-dashboard-deliveries',
  templateUrl: 'dashboard-deliveries.html'
})
export class DashboardDeliveries {
  @ViewChild('MapContainer') private readonly mapContainer: ElementRef;

  public shipNo: string;

  public customerName: string;
  public truckNumber: string;
  public eta: string;
  public distance: string;
  public invoices: string[];

  public showMap: boolean = false;
  public showDetails: boolean = false;

  public hasInfo: boolean = false;
  public isLoading: boolean = false;

  public errorMsg: string;

  constructor(
    public events: Events,
    private readonly dashboardProvider: DashboardProvider,
    private readonly mapInstance: GoogleMapsProvider
  ) {
    events.subscribe('shipNo:deliveries', (shipNo: string) => {
      this.shipNo = shipNo;

      this.fetchStoreRouteAndStops(shipNo);
    });
  }

  public toggleMap(off: boolean): void {
    this.showMap = off;
  }

  public toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  public handleShipNoChange(value: string): void {
    if (value.trim().length < 6) {
      return;
    }

    this.shipNo = value;

    this.fetchStoreRouteAndStops(value);
  }

  private fetchStoreRouteAndStops(shipNo: string): void {
    this.hasInfo = false;
    this.isLoading = true;

    this.dashboardProvider.getStoreRouteAndStops(shipNo).subscribe(response => {
      this.errorMsg = response.error;

      this.isLoading = false;

      if (response.error) {
        return;
      }

      this.truckNumber = response.truck.truckNumber;
      this.customerName = response.customerName;
      this.invoices = response.invoices;

      this.initMap(response);

      this.hasInfo = true;
    });
  }

  private initMap(data: any): void {
    this.mapInstance
      .initMap(this.mapContainer.nativeElement, {
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
          .subscribe(info => {
            this.eta = info.duration;
            this.distance = info.distance;
          });
      });
  }
}
