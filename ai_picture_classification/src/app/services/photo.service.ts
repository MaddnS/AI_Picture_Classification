import { Injectable } from '@angular/core';
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { UserPhoto } from '../types/userphoto';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { PhotoWithDetails } from '../types/photowithdetails';

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  public photos: UserPhoto[] = [];
  private PHOTO_STORAGE: string = 'photos';
  private platform: Platform;

  details: PhotoWithDetails = null;
  constructor(platform: Platform) {
    this.platform = platform;
  }

  public async makePhotoForAI() {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });
    const savedImageFile = await this.savePictureForAI(capturedPhoto);

    return { file: savedImageFile, photo: capturedPhoto };
  }

  public async addNewToGalleryWithDetails(
    photo: Photo,
    size: number,
    name: string,
    type: string,
    probability: number,
    lat: string,
    long: string
  ) {
    // Take a photo

    const savedImageFile = await this.savePicWithDetails(
      photo,
      size,
      name,
      type,
      probability,
      lat,
      long
    );

    console.log(savedImageFile);

    this.photos.unshift(savedImageFile);

    Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });
  }

  public async loadSavedWithDetails() {
    // Retrieve cached photo array data
    const photoList = await Preferences.get({ key: this.PHOTO_STORAGE });
    this.photos = JSON.parse(photoList.value) || [];

    console.log(this.photos);

    // Easiest way to detect when running on the web:
    // “when the platform is NOT hybrid, do this”
    if (!this.platform.is('hybrid')) {
      // Display the photo by reading into base64 format
      for (let photo of this.photos) {
        // Read each saved photo's data from the Filesystem
        const readFile = await Filesystem.readFile({
          path: photo.filepath,
          directory: Directory.Data,
          encoding: Encoding.UTF8,
        });

        // Web platform only: Load the photo as base64 data
        const pic: PhotoWithDetails = JSON.parse(readFile.data);

        photo.webviewPath = pic.photoAsBase64;
      }
    }
  }

  private async savePicWithDetails(
    photo: Photo,
    size: number,
    name: string,
    type: string,
    probability: number,
    lat: string,
    long: string
  ) {
    const base64Data = await this.readAsBase64(photo);
    const fileName = new Date().getTime() + '.json';
    const picWithDetails: PhotoWithDetails = {
      photoAsBase64: base64Data,
      details: {
        size: size,
        name: name,
        type: type,
        probability: probability,
        location: { lat: lat, long: long },
      },
    };

    const detailsToSave = JSON.stringify(picWithDetails);
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: detailsToSave,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });

    if (this.platform.is('hybrid')) {
      // Display the new image by rewriting the 'file://' path to HTTP
      // Details: https://ionicframework.com/docs/building/webview#file-protocol
      return {
        filepath: savedFile.uri,
        webviewPath: photo.webPath,
        path: savedFile,
        path2: Capacitor.convertFileSrc(savedFile.uri),
      };
    } else {
      // Use webPath to display the new image instead of base64 since it's
      // already loaded into memory
      return {
        filepath: fileName,
        webviewPath: photo.webPath,
        path: savedFile,
        path2: Capacitor.convertFileSrc(savedFile.uri),
      };
    }
  }

  private async savePictureForAI(photo: Photo) {
    const base64Data = await this.readAsBase64(photo);

    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data,
    });

    if (this.platform.is('hybrid')) {
      // Display the new image by rewriting the 'file://' path to HTTP
      // Details: https://ionicframework.com/docs/building/webview#file-protocol
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
        base64: base64Data,
      };
    } else {
      // Use webPath to display the new image instead of base64 since it's
      // already loaded into memory
      return {
        filepath: fileName,
        webviewPath: photo.webPath,
        base64: base64Data,
      };
    }
  }

  public async deletePicture(photo: UserPhoto, position: number) {
    // Remove this photo from the Photos reference data array
    this.photos.splice(position, 1);

    // Update photos array cache by overwriting the existing photo array
    Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });

    // delete photo file from filesystem
    const filename = photo.filepath.substr(photo.filepath.lastIndexOf('/') + 1);

    await Filesystem.deleteFile({
      path: filename,
      directory: Directory.Data,
    });
  }

  // ------------------------------------ HELPER ----------------------------------------------

  private async readAsBase64(photo: Photo) {
    // Fetch the photo, read as a blob, then convert to base64 format
    // "hybrid" will detect Cordova or Capacitor
    if (this.platform.is('hybrid')) {
      // Read the file into base64 format
      const file = await Filesystem.readFile({
        path: photo.path,
      });

      return file.data;
    } else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath);
      const blob = await response.blob();

      return (await this.convertBlobToBase64(blob)) as string;
    }
  }

  private convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
}
