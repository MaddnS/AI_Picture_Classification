import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TakePicturePage } from './takePicture.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { TakePicturePageRoutingModule } from './takePicture-routing.module';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    ExploreContainerComponentModule,
    TakePicturePageRoutingModule,
  ],
  declarations: [TakePicturePage],
})
export class TakePicturePageModule {}
