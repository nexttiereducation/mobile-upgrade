import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { GoogleMap, GoogleMaps, GoogleMapsAnimation, GoogleMapsEvent } from '@ionic-native/google-maps/ngx';
import { BehaviorSubject } from 'rxjs';

import { DonutChart } from '@nte/models/donut-chart.model';
import { CollegeService } from '@nte/services/college.service';

@Component({
  selector: `college-campus`,
  templateUrl: `college-campus.html`,
  styleUrls: [`college-campus.scss`],
  animations: [
    trigger(`mapState`, [
      state(`ready`,
        style({ opacity: 1 })
      ),
      state(`loading`,
        style({ opacity: 0 })
      ),
      transition(`* => *`, [
        animate(`6s 6s ease-in-out`)
        // cubic-bezier(0.4,0.0,0.2,1)
      ])
    ])
  ]
})
export class CollegeCampusPage {
  public animation = GoogleMapsAnimation;
  public college: any;
  public event = GoogleMapsEvent;
  public map: GoogleMap;

  private _mapReady: BehaviorSubject<boolean> = new BehaviorSubject(null);

  get details() {
    if (this.college && this.college.details) {
      return this.college.details;
    } else {
      return {};
    }
  }

  get fraternityChart() {
    if (this.details.percent_in_fraternity) {
      return new DonutChart(this.details.percent_in_fraternity);
    } else {
      return null;
    }
  }

  get latitude() {
    return +this.college.latitude;
  }

  get liveOnCampusChart() {
    if (this.details.percent_in_sorority) {
      return new DonutChart(this.details.percent_in_sorority);
    } else {
      return null;
    }
  }

  get longitude() {
    return +this.college.longitude;
  }

  get mapReady$() {
    return this._mapReady.asObservable();
  }
  set mapReady(ready: boolean) {
    this._mapReady.next(ready);
  }

  get outOfStateChart() {
    if (this.details.perecentage_fresh_out) {
      return new DonutChart(this.details.perecentage_fresh_out);
    } else {
      return null;
    }
  }

  get sororityChart() {
    if (this.details.percent_in_sorority) {
      return new DonutChart(this.details.in_sorority);
    } else {
      return null;
    }
  }
  get workOnCampusChart() {
    if (this.details.percent_working_students) {
      return new DonutChart(this.details.percent_working_students);
    } else {
      return null;
    }
  }

  constructor(public collegeService: CollegeService,
    private googleMaps: GoogleMaps) { }

  public ionViewDidLoad() {
    this.loadMap();
  }

  private loadMap() {
    // Create a map after the view is loaded.
    // (platform is already ready in app.component.ts)
    // var div = document.getElementById("map_canvas");
    // // Create a Google Maps native view under the map_canvas div.
    // var map = plugin.google.maps.Map.getMap(div);
    const latLng = {
      lat: this.latitude,
      lng: this.longitude
    };
    this.map = this.googleMaps.create(`map_canvas`, {
      camera: {
        target: latLng,
        zoom: 5
      }
    });
    this.map.on(this.event.MAP_READY)
      .subscribe(() => {
        console.log(`[MAP] Ready event.`);
        this.mapReady = true;
      });
    this.map.animateCamera({
      // bearing: 140,
      duration: 3000,
      target: latLng,
      tilt: 60,
      zoom: 10
    });
    this.map.addMarker({
      animation: this.animation.BOUNCE,
      position: latLng
    });

  }
}
