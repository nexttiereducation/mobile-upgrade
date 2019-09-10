import { animate, Component, state, style, transition, trigger } from '@angular/core';
import { GoogleMap, GoogleMaps, GoogleMapsAnimation, GoogleMapsEvent } from '@ionic-native/google-maps';
import { IonicPage, NavController, NavParams } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

import { DonutChart } from '@nte/models/donut-chart.model';
import { CollegeService } from '@nte/services/college.service';

@IonicPage({
  name: `college-campus-page`
})
@Component({
  selector: `college-campus`,
  templateUrl: `college-campus.html`,
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
  public latitude: number;
  public longitude: number;
  public map: GoogleMap;

  private _mapReady: BehaviorSubject<boolean> = new BehaviorSubject(null);

  get fraternityChart() {
    if (this.details.percent_in_fraternity) {
      return new DonutChart(this.details.percent_in_fraternity);
    } else {
      return null;
    }
  }
  get details() {
    if (this.college && this.college.details) {
      return this.college.details;
    } else {
      return {};
    }
  }
  get liveOnCampusChart() {
    if (this.details.percent_in_sorority) {
      return new DonutChart(this.details.percent_in_sorority);
    } else {
      return null;
    }
  }
  get mapReady$() {
    return this._mapReady.asObservable();
  }
  get outOfStateChart() {
    if (this.details.perecentage_fresh_out) {
      return new DonutChart(this.details.perecentage_fresh_out);
    } else {
      return null;
    }
  }
  set mapReady(ready: boolean) {
    this._mapReady.next(ready);
  }
  get sororityChart() {
    if (this.details.freshman_perecent_on_campus) {
      return new DonutChart(this.details.freshman_perecent_on_campus);
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

  constructor(public navCtrl: NavController,
    public params: NavParams,
    public collegeService: CollegeService,
    private googleMaps: GoogleMaps) {
    this.college = params.data;
  }

  public ionViewDidLoad() {
    this.loadMap();
  }

  private loadMap() {
    this.latitude = +this.college.latitude;
    this.longitude = +this.college.longitude;
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
