import { Component, OnInit } from '@angular/core';
import { PhotoService } from '../services/photo.service';
import {
  ActionSheetController,
  ModalController,
  Platform,
} from '@ionic/angular';
import { UserPhoto } from '../types/userphoto';

import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

import { PhotoWithDetails } from '../types/photowithdetails';
import { ModalComponent } from '../modal/modal.component';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-gallery',
  templateUrl: 'gallery.page.html',
  styleUrls: ['gallery.page.scss'],
})
export class GalleryPage implements OnInit {
  data: PhotoWithDetails;
  constructor(
    private photoService: PhotoService,
    private actionSheet: ActionSheetController,
    private modalCtrl: ModalController,
    private platform: Platform
  ) {}

  async ngOnInit() {
    //await this.photoService.loadSaved();
    await this.photoService.loadSavedWithDetails();

    Filesystem.stat({ path: '/', directory: Directory.Data })
      .then((info) => console.log('Stat Info: ', info))
      .catch((e) => console.log('Error occurred while doing stat: ', e));
  }

  public async showActionSheet(photo: UserPhoto, position: number) {
    const actionSheet = await this.actionSheet.create({
      header: 'Photos',
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.photoService.deletePicture(photo, position);
          },
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            // Nothing to do, action sheet is automatically closed
          },
        },
      ],
    });
    await actionSheet.present();
  }

  async showDetails(data) {
    this.data = null;

    console.log(data);
    console.log(Capacitor.convertFileSrc(data.filepath));

    /* await fetch(Capacitor.convertFileSrc(data.filepath))
      .then((response) => {
        return response.body;
      })
      .then((rb) => {
        const reader = rb.getReader();
        reader.read().then(({ done, value }) => {
          // If there is no more data to read
          if (done) {
            console.log('done', done);
            console.log('VAL', value);

            return;
          }
        });
      }); */

    if (this.platform.is('hybrid')) {
      await fetch(Capacitor.convertFileSrc(data.filepath))
        .then((response) => response.body)
        .then((rb) => {
          const reader = rb.getReader();

          return new ReadableStream({
            start(controller) {
              // The following function handles each data chunk
              function push() {
                // "done" is a Boolean and value a "Uint8Array"
                reader.read().then(({ done, value }) => {
                  // If there is no more data to read
                  if (done) {
                    // console.log('done', done);
                    controller.close();
                    return;
                  }
                  // Get the data and send it to the browser via the controller
                  controller.enqueue(value);
                  // Check chunks by logging to the console
                  //console.log(done, value);
                  push();
                });
              }

              push();
            },
          });
        })
        .then((stream) =>
          // Respond with our stream
          new Response(stream, {
            headers: { 'Content-Type': 'text/html' },
          }).text()
        )
        .then(async (result) => {
          // Do things with result

          this.data = await JSON.parse(result);

          console.log(this.data);
          this.data.photoAsBase64 =
            'data:image/jpeg;base64,' + this.data.photoAsBase64;
        });
    } else {
      const readFile = await Filesystem.readFile({
        path: data.filepath,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });

      this.data = await JSON.parse(readFile.data);
    }

    const modal = await this.modalCtrl.create({
      component: ModalComponent,
      componentProps: { showDetails: true, data: this.data },
    });
    modal.present();
  }
}
