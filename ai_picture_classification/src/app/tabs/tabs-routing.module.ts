import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'takePicture',
        loadChildren: () =>
          import('../takePicture/takePicture.module').then(
            (m) => m.TakePicturePageModule
          ),
      },
      {
        path: 'gallery',
        loadChildren: () =>
          import('../gallery/gallery.module').then((m) => m.GalleryPageModule),
      },
      {
        path: '',
        redirectTo: '/tabs/takePicture',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/takePicture',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
