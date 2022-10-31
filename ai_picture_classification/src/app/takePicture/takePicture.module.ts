import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TakePicturePage } from './takePicture.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { TakePicturePageRoutingModule } from './takePicture-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    TakePicturePageRoutingModule,
  ],
  declarations: [TakePicturePage],
})
export class TakePicturePageModule {}
