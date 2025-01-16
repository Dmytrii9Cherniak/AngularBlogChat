import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthRoutingModule } from './modules/auth/auth-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { authInterceptor } from './interceptors/auth.interceptor';
import { initializeApp } from './helpers/init.app';
import { AuthService } from './services/auth.service';
import { UserProfileService } from './services/user.profile.service';
import { TokenService } from './services/token.service';
import { WebsocketsService } from './services/websockets.service';
import { BroadcastChannelService } from './services/broadcast-channel.service';
import { ToastrModule } from 'ngx-toastr';
import { errorInterceptor } from './interceptors/error.interceptor';
import { toastrMessagesSettings } from './helpers/toastr.messages.settings';
import { LayoutModule } from './modules/layout/layout.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    LayoutModule,
    AppRoutingModule,
    AuthRoutingModule,
    FormsModule,
    ToastrModule.forRoot(toastrMessagesSettings)
  ],
  providers: [
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [
        AuthService,
        UserProfileService,
        TokenService,
        WebsocketsService,
        BroadcastChannelService
      ],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
