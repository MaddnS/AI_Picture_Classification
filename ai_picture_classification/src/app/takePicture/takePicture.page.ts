import { Component, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalComponent } from '../modal/modal.component';
import { PhotoService } from '../services/photo.service';
import { Photo } from '@capacitor/camera';
import { PhotoWithDetails } from '../types/photowithdetails';

@Component({
  selector: 'app-takePicture',
  templateUrl: 'takePicture.page.html',
  styleUrls: ['takePicture.page.scss'],
})
export class TakePicturePage {
  message: string;
  constructor(
    private photoService: PhotoService,
    private modalCtrl: ModalController
  ) {}

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }

  takePicture() {
    this.photoService.takePicture().then((photo) => {
      this.openModal(photo);
    });
  }

  async openModal(photo: Photo) {
    const modal = await this.modalCtrl.create({
      component: ModalComponent,
      componentProps: {
        size: this.message,
      },
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.photoService.addNewToGalleryWithDetails(
        photo,
        data,
        'TESTSTRING',
        'TESTSTRING',
        'TESTSTRING',
        'TESTSTRING'
      );
    }
  }
}
