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
import { authGuard } from '../../guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: AuthContainerComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      {
        path: 'request-reset-password',
        component: RequestPasswordResetComponent
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent,
        canActivate: [resetPasswordGuardGuard]
      },
      { path: 'register', component: RegisterComponent },
      {
        path: 'confirm-account',
        component: ConfirmAccountComponent,
        canActivate: [registerGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
