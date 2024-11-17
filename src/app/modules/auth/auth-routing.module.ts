import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from '../../components/auth/register/register.component';
import { LoginComponent } from '../../components/auth/login/login.component';
import { AuthContainerComponent } from '../../components/auth/auth-container/auth-container.component';
import { ConfirmAccountComponent } from '../../components/auth/confirm-account/confirm-account.component';
import { registerGuard } from '../../guards/register.guard';
import { ResetPasswordComponent } from '../../components/auth/forgot-password/reset-password.component';
import { RequestPasswordResetComponent } from '../../components/auth/request-password-reset/request-password-reset.component';
import { resetPasswordGuardGuard } from '../../guards/reset-password-guard.guard';

const routes: Routes = [
  {
    path: '',
    component: AuthContainerComponent,
    children: [
      { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
      { path: 'auth/login', component: LoginComponent },
      {
        path: 'auth/request-reset-password',
        component: RequestPasswordResetComponent
      },
      {
        path: 'auth/reset-password',
        component: ResetPasswordComponent,
        canActivate: [resetPasswordGuardGuard]
      },
      { path: 'auth/register', component: RegisterComponent },
      {
        path: 'auth/confirm-account',
        component: ConfirmAccountComponent,
        canActivate: [registerGuard]
      },
      { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
      { path: 'register', redirectTo: 'auth/register', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
