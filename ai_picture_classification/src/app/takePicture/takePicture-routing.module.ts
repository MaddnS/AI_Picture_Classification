import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TakePicturePage } from './takePicture.page';

const routes: Routes = [
  {
    path: '',
    component: TakePicturePage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TakePicturePageRoutingModule {}
