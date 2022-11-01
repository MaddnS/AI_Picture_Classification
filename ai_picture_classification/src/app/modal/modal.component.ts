import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { PhotoService } from '../services/photo.service';
import { PhotoWithDetails } from '../types/photowithdetails';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  size: number;

  name: string;

  @Input('details') showDetails;
  @Input('data') data: PhotoWithDetails;

  constructor(private modalCtrl: ModalController) {}

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  onSubmit(f: NgForm) {
    this.size = f.value.size;
    if (f.valid) {
      return this.modalCtrl.dismiss(this.size, 'confirm');
    }
  }
}
