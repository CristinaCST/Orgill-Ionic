/// <reference types="googlemaps" />

import { Injectable } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';
import { GMAPS_API_KEY } from '../../util/constants';
import { Observable } from 'rxjs';

/*
  Generated class for the GoogleMapsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class GoogleMapsProvider {
  private map: google.maps.Map;
  private readonly mapMarkers: google.maps.Marker[] = [];
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
   * Display a route between two points. In our Transportation app the origin point should be
   * the current truck position and the destination point should be the client location.
   * @param origin - start point or current position of truck.
   * @param destination - end point.
   * @param waypoints - array of points between origin and destination.
   * @param travelMode - DRIVING, BICYCLING, TRANSIT, WALKING.
   */
  public setMapRoute(
    origin: google.maps.DirectionsWaypoint,
    destination: string | google.maps.LatLng | google.maps.LatLngLiteral | google.maps.Place,
    waypoints: google.maps.DirectionsWaypoint[] = [],
    travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING
  ): Observable<any> {
    const directionsService: google.maps.DirectionsService = new google.maps.DirectionsService();
    const directionsRenderer: google.maps.DirectionsRenderer = new google.maps.DirectionsRenderer();

    directionsRenderer.setMap(this.map);
    directionsRenderer.setOptions({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#8EACFC',
        strokeOpacity: 1,
        strokeWeight: 5,
        zIndex: 1
      }
    });
    this.drawMarkers(origin.location, destination, true);

    return Observable.create(observer => {
      directionsService.route(
        { origin: origin.location, destination, waypoints, travelMode },
        (result, status) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);

            observer.next(this.calculateTotalDistanceAndTime(result));
          } else {
            console.warn('Error: ' + status);
          }
        }
      );
    });
  }

  /**
   * Place custom markers on map for origin and destination.
   * @param origin - start point.
   * @param destination - end point.
   * @param truckMarkerAtOrigin - origin marker will be replaced with a truck icon.
   */
  private drawMarkers(
    origin: string | google.maps.LatLng | google.maps.LatLngLiteral | google.maps.Place,
    destination: string | google.maps.LatLng | google.maps.LatLngLiteral | google.maps.Place,
    truckMarkerAtOrigin: boolean = false
  ): void {
    const markerOptions: any = {
      icon: {
        url: '../../assets/imgs/icon-route-start.png',
        scaledSize: new google.maps.Size(15, 15),
        zIndex: 1
      }
    };

    if (truckMarkerAtOrigin) {
      markerOptions.icon = {
        url: '../../assets/imgs/icon-truck.png',
        scaledSize: new google.maps.Size(50, 37),
        zIndex: 3
      };
    }
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
  }

  /**
   * The directions service will sometime return segmented values for distance and duration,
   * this function will calculate the total for both.
   * @param data - the response from the directions service request
   * @return - total distance and duration.
   */
  private calculateTotalDistanceAndTime(data: google.maps.DirectionsResult): any {
    let totalDistance: number = 0;
    let totalTime: number = 0;
    const results = {
      distance: '',
      duration: ''
    };

    data.routes[0].legs.forEach(leg => {
      totalDistance += leg.distance.value;
      totalTime += leg.duration.value;
    });

    results.distance = `${Math.round(totalDistance / 1609.344)} miles`; // meters to miles
    results.duration = `${Math.floor(totalTime / 3600)} hours ${Math.round((totalTime % 3600) / 60)} minutes`; // seconds to hours and minutes

    return results;
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
   * @param markerIndex - the index of the marker to be removed.
   */
  public removeMapMarkers(markerIndex: number): void {
    this.mapMarkers.splice(markerIndex, 1)[0].setMap(undefined);
  }

  public getLatLng(latitude: number, longitude: number): google.maps.LatLng {
    return new google.maps.LatLng(latitude, longitude);
  }
}
