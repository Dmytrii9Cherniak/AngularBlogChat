import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '../../components/auth/login/login.component';
import { RegisterComponent } from '../../components/auth/register/register.component';
import { ConfirmAccountComponent } from '../../components/auth/confirm-account/confirm-account.component';
import { RequestPasswordResetComponent } from '../../components/auth/request-password-reset/request-password-reset.component';
import { ResetPasswordComponent } from '../../components/auth/forgot-password/reset-password.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'confirm-account', component: ConfirmAccountComponent },
  { path: 'request-reset-password', component: RequestPasswordResetComponent },
  { path: 'reset-password', component: ResetPasswordComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
