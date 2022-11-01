import { Photo } from '@capacitor/camera';
export interface PhotoWithDetails {
  photoAsBase64: string;
  details: {
    size: number;
    name: string;
    type: string;
    location: {
      lat: string;
      long: string;
    };
  };
}
