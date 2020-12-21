/// <reference types="googlemaps" />

import { Injectable } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';
import { GMAPS_API_KEY } from '../../util/constants';
import { Observable, Subscription } from 'rxjs';

/*
  Generated class for the GoogleMapsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class GoogleMapsProvider {
  private map: google.maps.Map;
  private readonly mapMarkers: google.maps.Marker[] = [];
  private sortedWaypoints: google.maps.DirectionsWaypoint[];
  private sortedWaypointsForTruckRoute: google.maps.DirectionsWaypoint[];
  private mapLoaded: boolean;
  private readonly loader: Loader = new Loader({
    apiKey: GMAPS_API_KEY,
    version: 'weekly'
  });

  /**
   * @param mapElement - container for google maps.
   * @param mapOptions - object of options for google maps.
   * more here: https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions
   */
  public initMap(mapElement: HTMLElement, mapOptions?: google.maps.MapOptions): Promise<any> {
    return this.loader.load().then(() => {
      this.map = new google.maps.Map(mapElement, mapOptions);
    });
  }

  public updateMapOptions(mapOptions: google.maps.MapOptions): void {
    this.map.setOptions(mapOptions);
  }

  /**
   * Display a route between two points. If we assume that the trucks position is dynamic,
   * then the route should update according to its location.
   * @param origin - start point.
   * @param destination - end point.
   * @param truckLocation - current position of truck.
   * @param waypoints - array of points between origin and destination.
   * @param travelMode - DRIVING, BICYCLING, TRANSIT, WALKING.
   */
  public setMapRoute(
    origin: string | google.maps.LatLng | google.maps.LatLngLiteral | google.maps.Place,
    destination: string | google.maps.LatLng | google.maps.LatLngLiteral | google.maps.Place,
    truckLocation: google.maps.DirectionsWaypoint,
    waypoints: google.maps.DirectionsWaypoint[] = [],
    travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING
  ): void {
    const directionsService: google.maps.DirectionsService = new google.maps.DirectionsService();
    const directionsRenderer: google.maps.DirectionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(this.map);

    this.computeStops(origin, truckLocation, waypoints).subscribe({
      complete: () => {
        directionsService.route(
          { origin, destination, waypoints: this.sortedWaypoints, travelMode },
          (result, status) => {
            if (status === 'OK') {
              directionsRenderer.setOptions({
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: '#8EACFC',
                  strokeOpacity: 1,
                  strokeWeight: 5,
                  zIndex: 1
                }
              });

              directionsRenderer.setDirections(result);
            } else {
              console.warn('Error: ' + status);
            }
          }
        );

        this.drawTruckRoute(origin, truckLocation.location);
      }
    });

    this.drawMarkers(origin, destination, truckLocation);
  }

  /**
   * This will sort the waypoints by distance, the trucks location will also
   * be treated as a waypoint.
   * @param origin - start point.
   * @param waypoints - array of points between origin and destination.
   * @param travelMode - DRIVING, BICYCLING, TRANSIT, WALKING.
   */
  private computeStops(
    origin: string | google.maps.LatLng | google.maps.LatLngLiteral | google.maps.Place,
    truckLocation: google.maps.DirectionsWaypoint,
    waypoints: google.maps.DirectionsWaypoint[],
    travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING
  ): Observable<any> {
    const waypointsDistance = {};
    let waypointsDistanceKeys: any[];
    let truckLocationDistance: number;

    const distanceMatrix: google.maps.DistanceMatrixService = new google.maps.DistanceMatrixService();
    return Observable.create(observer => {
      waypoints.unshift(truckLocation); // put truckLocation at index zero
      // TODO: this could be better written
      waypoints.forEach((waypoint, index) => {
        distanceMatrix.getDistanceMatrix(
          { origins: [origin], destinations: [waypoint.location], travelMode },
          (result, status) => {
            if (status === 'OK') {
              const distance: number = result.rows[0].elements[0].distance.value;
              waypointsDistance[distance] = waypoint;
              waypointsDistanceKeys = Object.keys(waypointsDistance);

              if (index === 0) {
                truckLocationDistance = distance;
              }

              if (index + 1 === waypoints.length) {
                waypointsDistanceKeys.sort((a, b) => a - b);

                this.sortedWaypoints = waypointsDistanceKeys.map(key => waypointsDistance[key]);

                this.sortedWaypointsForTruckRoute = waypointsDistanceKeys
                  .filter(key => truckLocationDistance > key)
                  .map(key => waypointsDistance[key]);

                observer.complete();
              }
            } else {
              console.warn('Error: ' + status);
            }
          }
        );
      });
    });
  }

  /**
   * Draw a route from origin to truckLocation.
   * This one will have a dark blue.
   * @param origin - start point.
   * @param truckLocation - current position of truck.
   */
  private drawTruckRoute(
    origin: string | google.maps.LatLng | google.maps.LatLngLiteral | google.maps.Place,
    truckLocation: string | google.maps.LatLng | google.maps.LatLngLiteral | google.maps.Place
  ): void {
    const directionsService: google.maps.DirectionsService = new google.maps.DirectionsService();
    const directionsRenderer: google.maps.DirectionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(this.map);

    directionsService.route(
      {
        origin,
        destination: truckLocation,
        waypoints: this.sortedWaypointsForTruckRoute,
        travelMode: google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setOptions({
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#2F67FF',
              strokeOpacity: 1,
              strokeWeight: 5,
              zIndex: 2
            }
          });

          directionsRenderer.setDirections(result);
        } else {
          console.warn('Error: ' + status);
        }
      }
    );
  }

  /**
   * Place custom markers on map.
   * TODO: this could be handled better
   * @param origin - start point.
   * @param destination - end point.
   * @param truckLocation - current position of truck.
   */
  private drawMarkers(
    origin: string | google.maps.LatLng | google.maps.LatLngLiteral | google.maps.Place,
    destination: string | google.maps.LatLng | google.maps.LatLngLiteral | google.maps.Place,
    truckLocation: google.maps.DirectionsWaypoint
  ): void {
    const markerOptions: any = {
      icon: {
        url: '../../assets/imgs/icon-route-start.png',
        scaledSize: new google.maps.Size(15, 15),
        zIndex: 1
      }
    };
    this.addMapMarkers([origin], markerOptions);

    markerOptions.icon = {
      url: '../../assets/imgs/icon-route-end.png',
      scaledSize: new google.maps.Size(15, 15),
      zIndex: 1
    };
    this.addMapMarkers([destination], markerOptions);

    markerOptions.icon = {
      url: '../../assets/imgs/icon-map.png',
      scaledSize: new google.maps.Size(60, 44),
      zIndex: 2
    };
    this.addMapMarkers([destination], markerOptions);

    markerOptions.icon = {
      url: '../../assets/imgs/icon-truck.png',
      scaledSize: new google.maps.Size(50, 37),
      zIndex: 3
    };
    this.addMapMarkers([truckLocation.location], markerOptions);
  }

  /**
   * address - the string address to be converted to geographic coordinates
   */
  public getGeocodedAddress(address: string): Observable<any> {
    return Observable.create(observer => {
      new google.maps.Geocoder().geocode({ address }, (result, status) => {
        if (status === 'OK') {
          const location = result[0].geometry.location;
          observer.next(this.getLatLng(location.lat(), location.lng()));
        } else {
          console.warn('Error: ' + status);
        }
      });
    });
  }

  public getEtaAndDistance(origin, destination): Observable<any> {
    return Observable.create(observer => {
      new google.maps.DistanceMatrixService().getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === 'OK') {
            const element = result.rows[0].elements[0];
            observer.next({ eta: element.duration.text, distance: element.distance.text });
          }
        }
      );
    });
  }

  /**
   * @param markers - array of coordinates to place markers at.
   */
  public addMapMarkers(markers: any[], otherOptions): void {
    const markerOptions: google.maps.MarkerOptions = {
      map: this.map
    };

    // tslint:disable-next-line: forin
    for (const option in otherOptions) {
      markerOptions[option] = otherOptions[option];
    }

    markers.forEach(marker => {
      markerOptions.position = marker;
      this.mapMarkers.push(new google.maps.Marker(markerOptions));
    });
  }

  /**
   *
   * @param markerIndex - the index of the marker to be removed.
   */
  public removeMapMarkers(markerIndex: number): void {
    this.mapMarkers.splice(markerIndex, 1)[0].setMap(undefined);
  }

  public getLatLng(latitude: number, longitude: number): google.maps.LatLng {
    return new google.maps.LatLng(latitude, longitude);
  }
}
