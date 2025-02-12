import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserProfileService } from '../../../services/user.profile.service';
import { ChangePasswordModel } from '../../../models/profile/change.password.model';
import { ToastrService } from 'ngx-toastr';
import { BlacklistUsersListModel } from '../../../models/blacklist/blacklist.users.list';
import { passwordMatchValidator } from '../../../validators/password.match.validator';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile-data.component.html',
  styleUrls: ['./user-profile-data.component.scss']
})
export class UserProfileDataComponent implements OnInit {
  activeTab: string = 'basicInfo';
  profileForm: FormGroup;
  newPasswordForm: FormGroup;
  changePasswordServerError: string | null = null;
  public blackListUsers: BlacklistUsersListModel[] = [];

  passwordPattern: RegExp =
    /^(?=.*[!@#$%^&*()_+}{":;'?/>.<,`~])(?=.*\d)[^\s]{8,}$/;

  constructor(
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private toastrService: ToastrService,
    private usersService: UsersService
  ) {
    this.profileForm = this.fb.group({
      username: ['User123'],
      nickname: ['User1'],
      email: ['user@example.com'],
      phone: ['+380971234567'],
      aboutMe: ['Я Angular розробник'],
      country: ['Україна'],
      timeZone: ['UTC+02:00'],
      twoFactor: ['disabled']
    });
  }

  ngOnInit(): void {
    this.newPasswordForm = this.fb.group(
      {
        current_password: ['', Validators.required],
        new_password: [
          '',
          [Validators.required, Validators.pattern(this.passwordPattern)]
        ],
        confirm_password: ['', Validators.required]
      },
      { validators: passwordMatchValidator() } // Кастомний валідатор для перевірки збігу паролів
    );

    this.usersService.getMyBlackUsersList().subscribe({
      next: (value) => {
        this.blackListUsers = value;
      }
    });
  }

  setActiveTab(tabName: string) {
    this.activeTab = tabName;
  }

  unblockUser(id: number): void {
    this.usersService.blockOrUnblockCertainUser(id).subscribe({
      next: () => {
        this.blackListUsers = this.blackListUsers.filter(
          (el) => el.blocked_user.id !== id
        );
      }
    });
  }

  public changeProfilePassword() {
    if (this.newPasswordForm.invalid) {
      return;
    }

    const body = new ChangePasswordModel(
      this.newPasswordForm.controls['current_password'].value,
      this.newPasswordForm.controls['new_password'].value,
      this.newPasswordForm.controls['confirm_password'].value
    );

    this.userProfileService.changeUserPassword(body).subscribe({
      next: () => {
        this.toastrService.success('Password changed successfully');
        this.changePasswordServerError = null;
        this.newPasswordForm.reset();
      },
      error: (err) => {
        if (err.error?.detail) {
          this.changePasswordServerError = err.error.detail;
        } else {
          this.toastrService.error('Something went wrong');
        }
      }
    });
  }
}
