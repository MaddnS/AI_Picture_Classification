import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalComponent } from '../modal/modal.component';
import { PhotoService } from '../services/photo.service';
import { Photo } from '@capacitor/camera';
import { Prediction } from '../types/prediction';
//import * as mobilenet from '@tensorflow-models/mobilenet';
import { Platform } from '@ionic/angular';
import * as tf from '@tensorflow/tfjs';
import { HttpClient } from '@angular/common/http';
import * as env from '../../environments/environment';
import { string, TensorContainer } from '@tensorflow/tfjs-core';

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
  result: any;
  show: any[];
  classNames: string[] = [
    'gewoehnlicheGelbflechte',
    'Mauerflechte',
    'HelmSchwielenflechte',
    'weisseBlatternflechte',
    'zierlicheGelbflechte',
  ];

  constructor(
    private photoService: PhotoService,
    private modalCtrl: ModalController,
    private platform: Platform,
    private http: HttpClient
  ) {}

  async ngOnInit() {
    //const modelUrl = '../model/model.json';
    const modelUrl = 'http://localhost:42069/lichen_model';
    this.loading = true;
    //this.model = await mobilenet.load();
    this.modelKeras = await tf.loadLayersModel(modelUrl);
    console.log('model loaded: ', this.modelKeras);

    this.loading = false;
  }

  async fileChangeEvent(event) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]);

      reader.onload = (res: any) => {
        this.imageSrc = res.target.result;

        setTimeout(async () => {
          const myImage = new Image(180, 180);
          myImage.src = res.target.result;
          const imgEl = this.imageEl.nativeElement;
          const imgForClassification = tf.browser.fromPixels(myImage);
          const x = tf.expandDims(imgForClassification, null);
          this.predictions = this.modelKeras.predict(x);
          this.result = await this.predictions.dataSync();
          if (this.result) {
            const prob = tf.softmax(this.result).dataSync();

            let show = [];
            for (let i = 0; i < this.result.length; i++) {
              show.push({
                name: this.classNames[i],
                value: (Math.round(prob[i] * 1000) / 1000) * 100,
              });
            }
            console.log(this.result);
            console.log(show);
            this.show = show;
          }
        }, 0);
      };
    }
  }

  classifyCamPic() {
    this.photoService.makePhotoForAI().then((data) => {
      this.imageSrc = data.file.base64;
      const myImage = new Image(180, 180);

      if (this.platform.is('hybrid')) {
        myImage.src = '	data:image/jpeg;base64,' + data.file.base64;
        this.imageSrc = data.file.webviewPath;
      } else {
        myImage.src = data.file.base64;
        this.imageSrc = data.file.base64;
      }

      setTimeout(async () => {
        const imgForClassification = tf.browser.fromPixels(myImage);
        const x = tf.expandDims(imgForClassification, null);
        this.predictions = await this.modelKeras.predict(x);
        this.result = await this.predictions.dataSync();
        if (this.result) {
          const prob = tf.softmax(this.result).dataSync();

          let show = [];
          for (let i = 0; i < this.result.length; i++) {
            show.push({
              name: this.classNames[i],
              value: (Math.round(prob[i] * 1000) / 1000) * 100,
            });
          }
          console.log(this.result);
          console.log(show);
          this.show = show;
        }
      }, 0);
    });
  }

  classifyAndSave() {
    this.photoService.makePhotoForAI().then((data) => {
      this.imageSrc = data.file.base64;
      const myImage = new Image(180, 180);

      if (this.platform.is('hybrid')) {
        myImage.src = '	data:image/jpeg;base64,' + data.file.base64;
        this.imageSrc = data.file.webviewPath;
      } else {
        myImage.src = data.file.base64;
        this.imageSrc = data.file.base64;
      }

      setTimeout(async () => {
        const imgForClassification = tf.browser.fromPixels(myImage);
        const x = tf.expandDims(imgForClassification, null);
        this.predictions = await this.modelKeras.predict(x);
        this.result = await this.predictions.dataSync();
        if (this.result) {
          const prob = tf.softmax(this.result).dataSync();

          let show = [];
          for (let i = 0; i < this.result.length; i++) {
            show.push({
              name: this.classNames[i],
              value: (Math.round(prob[i] * 1000) / 1000) * 100,
            });
          }
          console.log(this.result);
          console.log(show);
          this.show = show;
        }
      }, 0);

      setTimeout(async () => {
        const prob: number[] = tf.softmax(this.result).dataSync();
        const max = Math.max(...prob);
        const idx = prob.indexOf(max);
        const type = this.classNames[idx];
        console.log(max);

        this.addDetailsToPicture(
          data.photo,
          type,
          (Math.round(max * 1000) / 1000) * 100,
          'lat',
          'long'
        );
      }, 1);
    });
  }

  takePicture() {
    this.photoService.takePicture().then((photo) => {
      this.addDetailsToPicture(photo, '', 0, '', '');
    });
  }

  async addDetailsToPicture(
    photo: Photo,
    type: string,
    probability: number,
    lat: string,
    long: string
  ) {
    const modal = await this.modalCtrl.create({
      component: ModalComponent,
      componentProps: {
        size: this.message,
      },
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();
    console.log(data);

    if (role === 'confirm') {
      this.photoService.addNewToGalleryWithDetails(
        photo,
        data.size,
        data.name,
        type,
        probability,
        lat,
        long
      );
    }
  }
}
