import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalComponent } from '../modal/modal.component';
import { PhotoService } from '../services/photo.service';
import { Photo } from '@capacitor/camera';
import { Prediction } from '../types/prediction';
//import * as mobilenet from '@tensorflow-models/mobilenet';
import { Platform } from '@ionic/angular';
import * as tf from '@tensorflow/tfjs';

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
  predictions: Prediction[] | any;
  @ViewChild('img') imageEl: ElementRef;
  modelKeras: tf.LayersModel;

  constructor(
    private photoService: PhotoService,
    private modalCtrl: ModalController,
    private platform: Platform
  ) {}

  async ngOnInit() {
    //const modelUrl = '../model/model.json';
    const modelUrl = 'http://localhost:42069/lichen_model';
    this.loading = true;
    //this.model = await mobilenet.load();
    this.modelKeras = await tf.loadLayersModel(modelUrl);
    this.loading = false;
  }

  async fileChangeEvent(event) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]);

      reader.onload = (res: any) => {
        this.imageSrc = res.target.result;
        setTimeout(async () => {
          const imgEl = await tf.browser.fromPixels(this.imageEl.nativeElement);
          //this.predictions = await this.model.classify(imgEl);
          this.predictions = await this.modelKeras.predict([imgEl], {
            batchSize: 1,
          });
        }, 0);
      };
    }
  }

  classifyCamPic() {
    this.photoService.makePhotoForAI().then((data) => {
      this.imageSrc = data.base64;
      const myImage = new Image(256, 256);

      if (this.platform.is('hybrid')) {
        myImage.src = '	data:image/jpeg;base64,' + data.base64;
        this.imageSrc = data.webviewPath;
      } else {
        myImage.src = data.base64;
        this.imageSrc = data.base64;
      }

      setTimeout(async () => {
        //this.predictions = await this.model.classify(myImage);
        const imgForClassification = tf.browser.fromPixels(myImage);
        this.predictions = await this.modelKeras.predict(imgForClassification);
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
