import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalComponent } from '../modal/modal.component';
import { PhotoService } from '../services/photo.service';
import { Photo } from '@capacitor/camera';
import { Prediction } from '../types/prediction';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-takePicture',
  templateUrl: 'takePicture.page.html',
  styleUrls: ['takePicture.page.scss'],
})
export class TakePicturePage implements OnInit {
  message: string;
  model: any;
  loading: boolean;
  imageSrc: string;
  predictions: Prediction[];

  @ViewChild('img') imageEl: ElementRef;
  constructor(
    private photoService: PhotoService,
    private modalCtrl: ModalController,
    private platform: Platform
  ) {}

  async ngOnInit() {
    const modelUrl =
      'https://storage.googleapis.com/tfjs-models/savedmodel/mobilenet_v2_1.0_224/model.json';
    this.loading = true;
    this.model = await mobilenet.load();
    //this.model = await tf.loadGraphModel(modelUrl);
    this.loading = false;
  }

  async fileChangeEvent(event) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]);

      reader.onload = (res: any) => {
        this.imageSrc = res.target.result;
        setTimeout(async () => {
          const imgEl = this.imageEl.nativeElement;
          this.predictions = await this.model.classify(imgEl);
        }, 0);
      };
    }
  }

  classifyCamPic() {
    this.photoService.makePhotoForAI().then((data) => {
      this.imageSrc = data.base64;
      const myImage = new Image(1024, 1024);

      if (this.platform.is('hybrid')) {
        myImage.src = '	data:image/jpeg;base64,' + data.base64;
        this.imageSrc = data.webviewPath;
      } else {
        myImage.src = data.base64;
        this.imageSrc = data.base64;
      }

      setTimeout(async () => {
        this.predictions = await this.model.classify(myImage);
      }, 0);
    });
  }

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }

  takePicture() {
    this.photoService.takePicture().then((photo) => {
      this.addDetailsToPicture(photo);
    });
  }

  async addDetailsToPicture(photo: Photo) {
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
