import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // private user: firebase.User;

  constructor(
  ) {
    // tslint:disable:no-console
    // this.afAuth.signInWithFacebook
    // authState.subscribe(user => {
    // 	this.user = user;
    // });
  }

  // loginViaGoogle() {
  //   this.oAuthSignIn(new GoogleAuthService)
  //     .then(
  //       result => { console.log(result) },
  //       err => console.error(err)
  //     )
  // }

  // private oAuthSignIn(service: AuthService) {
  //   if (!(<any>window).cordova) {
  //     return this.afAuth.signInWithPopup(service);
  //   } else {
  //     return this.afAuth.signInWithRedirect(service)
  //     .then(() => {
  //       return this.afAuth.getRedirectResult().then( result => {
  //         // This gives you a Google Access Token.
  //         // You can use it to access the Google API.
  //         let token = result.credential.accessToken;
  //         // The signed-in user info.
  //         let user = result.user;
  //         console.log(token, user);
  //       }).catch(function(error) {
  //         // Handle Errors here.
  //         alert(error.message);
  //       });
  //     });
  //   }
  // }

  // getUser() {
  //   this.afAuth.signInWithGoogle().then((userInfo) => {
  //     // user information or null if not logged in
  //   });
  // }
}
