import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PgSidenavComponent } from '../../components/layout/pg-sidenav/pg-sidenav.component';
import { PageContainerComponent } from '../../components/layout/page-container/page-container.component';
import { MainLayoutComponent } from '../../components/layout/main-layout/main-layout.component';

@NgModule({
  declarations: [
    PgSidenavComponent,
    PageContainerComponent,
    MainLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
  ],
  exports: [MainLayoutComponent]
})
export class LayoutModule {}
