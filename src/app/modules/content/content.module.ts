import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContentRoutingModule } from './content-routing.module';
import { PostsListComponent } from '../../components/content/posts-list/posts-list.component';

@NgModule({
  declarations: [PostsListComponent],
  imports: [CommonModule, ContentRoutingModule]
})
export class ContentModule {}
