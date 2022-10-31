import { Component } from '@angular/core';
import { PhotoService } from '../services/photo.service';

@Component({
  selector: 'app-takePicture',
  templateUrl: 'takePicture.page.html',
  styleUrls: ['takePicture.page.scss'],
})
export class TakePicturePage {
  constructor(private photoService: PhotoService) {}

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }
}
