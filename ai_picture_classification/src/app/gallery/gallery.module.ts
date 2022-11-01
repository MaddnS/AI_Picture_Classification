import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GalleryPage } from './gallery.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { GalleryPageRoutingModule } from './gallery-routing.module';
import { HammerModule } from '@angular/platform-browser';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    GalleryPageRoutingModule,
    HammerModule,
  ],
  declarations: [GalleryPage],
})
export class GalleryPageModule {}
