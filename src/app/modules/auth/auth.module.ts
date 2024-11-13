import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { RegisterComponent } from '../../components/auth/register/register.component';
import { LoginComponent } from '../../components/auth/login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthContainerComponent } from '../../components/auth/auth-container/auth-container.component';
import { ConfirmAccountComponent } from '../../components/auth/confirm-account/confirm-account.component';
import { CodeInputModule } from 'angular-code-input';
import { ForgotPasswordComponent } from '../../components/auth/forgot-password/forgot-password.component';

@NgModule({
  declarations: [
    AuthContainerComponent,
    LoginComponent,
    RegisterComponent,
    ConfirmAccountComponent,
    ForgotPasswordComponent
  ],
  exports: [LoginComponent],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    CodeInputModule
  ]
})
export class AuthModule {}
