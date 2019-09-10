import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FileService {
  // private location;

  constructor() {
    // private file: File
    // requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    // this.location = this.file.dataDirectory;
  }

  // download() {
  //   window.requestFileSystem(
  //     LocalFileSystem.PERSISTENT,
  //     0,
  //     (fileSystem) => {
  //       console.log(`file system open: ${fileSystem.name}`);
  //       fileSystem.root.getFile(
  //         `bot.png`,
  //         { create: true, exclusive: false },
  //         (fileEntry) => {
  //           console.log(`fileEntry is file? ${fileEntry.isFile.toString()}`);
  //           const oReq = new XMLHttpRequest();
  //           // Make sure you add the domain name to the Content-Security-Policy <meta> element.
  //           oReq.open(`GET`, `http://cordova.apache.org/static/img/cordova_bot.png`, true);
  //           // Define how you want the XHR data to come back
  //           oReq.responseType = `blob`;
  //           oReq.onload = function (_oEvent) {
  //             const blob = oReq.response; // Note: not oReq.responseText
  //             if (blob) {
  //               // Create a URL based on the blob, and set an <img> tag`s src to it.
  //               const url = window.URL.createObjectURL(blob);
  //               document.getElementById(`bot-img`).src = url;
  //               // Or read the data with a FileReader
  //               // const reader = new FileReader();
  //               // reader.addEventListener(`loadend`, function () {
  //               //   // reader.result contains the contents of blob as text
  //               // });
  //               // reader.readAsText(blob);
  //             } else {
  //               console.error(`we didnt get an XHR response!`);
  //             }
  //           };
  //           oReq.send(null);
  //         },
  //         err => console.error(`error getting file! ${err}`)
  //       );
  //     },
  //     err => console.error(`error getting persistent fs! ${err}`)
  //   );
  // }

  // upload() {
  //   window.requestFileSystem(
  //     LocalFileSystem.PERSISTENT,
  //     0,
  //     fileSystem => {
  //       console.log(`file system open: ${fileSystem.name}`);
  //       fileSystem.root.getFile(
  //         `bot.png`,
  //         { create: true, exclusive: false },
  //         fileEntry => {
  //           fileEntry.file(
  //             file => {
  //               const reader = new FileReader();
  //               reader.onloadend = function () {
  //                 // Create a blob based on the FileReader `result`,
  //                 // which we asked to be retrieved as an ArrayBuffer
  //                 const blob = new Blob(
  //                   [new Uint8Array(this.result)],
  //                   { type: `image/png` }
  //                 );
  //                 const oReq = new XMLHttpRequest();
  //                 oReq.open(`POST`, `http://mysweeturl.com/upload_handler`, true);
  //                 oReq.onload = function (_oEvent) {
  //                   // all done!
  //                 };
  //                 // Pass the blob in to XHR`s send method
  //                 oReq.send(blob);
  //               };
  //               // Read the file as an ArrayBuffer
  //               reader.readAsArrayBuffer(file);
  //             },
  //             err => console.error(`error getting fileentry file!` + err)
  //           );
  //         },
  //         err => console.error(`error getting file! ` + err)
  //       );
  //     },
  //     err => console.error(`error getting persistent fs! ` + err)
  //   );
  // }
}
