import { Component, OnInit } from '@angular/core';
import { PhotoService } from '../services/photo.service';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { UserPhoto } from '../types/userphoto';

import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { PhotoWithDetails } from '../types/photowithdetails';
import { ModalComponent } from '../modal/modal.component';

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
    private modalCtrl: ModalController
  ) {}

  async ngOnInit() {
    //await this.photoService.loadSaved();
    await this.photoService.loadSavedWithDetails();
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

    const readFile = await Filesystem.readFile({
      path: data.filepath,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });

    this.data = JSON.parse(readFile.data);

    const modal = await this.modalCtrl.create({
      component: ModalComponent,
      componentProps: { showDetails: true, data: this.data },
    });
    modal.present();
  }
}
