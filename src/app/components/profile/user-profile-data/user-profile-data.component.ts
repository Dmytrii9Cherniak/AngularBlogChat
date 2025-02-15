import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { UserProfileService } from '../../../services/user.profile.service';
import { ToastrService } from 'ngx-toastr';
import { UsersService } from '../../../services/users.service';
import { BehaviorSubject } from 'rxjs';
import { UserProfile } from '../../../models/profile/full.user.profile.data.model';
import { Socials } from '../../../models/profile/socials.profile.info.model';
import { passwordMatchValidator } from '../../../validators/password.match.validator';
import { ChangePasswordModel } from '../../../models/profile/change.password.model';
import { GeneralProfileModel } from '../../../models/profile/general.profile.model';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile-data.component.html',
  styleUrls: ['./user-profile-data.component.scss']
})
export class UserProfileDataComponent implements OnInit {
  newPasswordForm: FormGroup;
  changePasswordServerError: string | null = null;
  userProfile$ = new BehaviorSubject<UserProfile | null>(null);
  userProfile!: UserProfile;

  avatarPreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  socialsForm!: FormGroup;
  isEditMode: boolean = false;
  originalSocials!: Socials;

  blackListUsers: any[] = [];

  generalProfileForm!: FormGroup;
  isGeneralEditMode: boolean = false;

  passwordPattern: RegExp =
    /^(?=.*[!@#$%^&*()_+}{":;'?/>.<,`~])(?=.*\d)[^\s]{8,}$/;

  constructor(
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private toastrService: ToastrService,
    private usersService: UsersService
  ) {}

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
      { validators: passwordMatchValidator() }
    );

    this.userProfileService.getFullMyProfileData().subscribe((user) => {
      if (user) {
        this.userProfile = user;
        this.userProfile$.next(user);
        this.createSocialsForm(user.socials);
        this.createGeneralProfileForm(user);
      }
    });

    this.usersService.getMyBlackUsersList().subscribe((users) => {
      this.blackListUsers = users;
    });
  }

  private createGeneralProfileForm(user: UserProfile): void {
    this.generalProfileForm = this.fb.group({
      avatar: [user.avatar],
      gender: [user.gender],
      country: [user.country],
      about_me: [user.about_me],
      username: [user.username],
      birthday: [user.birthday],
      time_zones: [user.time_zones],
      phone_number: [user.phone_number],
      business_email: [user.business_email, [Validators.email]],

      technologies: this.fb.array(
        user.technologies?.map((tech) =>
          this.fb.control(tech.name, Validators.required)
        ) || []
      )
    });
  }

  enterGeneralEditMode(): void {
    this.isGeneralEditMode = true;
  }

  cancelGeneralEditMode(): void {
    this.createGeneralProfileForm(this.userProfile);
    this.isGeneralEditMode = false;
  }

  addTechnology(): void {
    this.technologies.push(
      new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required]
      })
    );
  }

  removeTechnology(index: number): void {
    const techArray = this.generalProfileForm.get('technologies') as FormArray;
    techArray.removeAt(index);
  }

  saveGeneralProfile(): void {
    if (this.generalProfileForm.invalid) {
      this.toastrService.error('Будь ласка, заповніть всі обов’язкові поля');
      return;
    }

    const updatedProfile: Partial<GeneralProfileModel> = {};

    Object.keys(this.generalProfileForm.controls).forEach((key) => {
      const formControl = this.generalProfileForm.get(key);
      if (
        formControl?.dirty &&
        formControl.value !== this.userProfile[key as keyof UserProfile]
      ) {
        updatedProfile[key as keyof GeneralProfileModel] =
          formControl.value || null;
      }
    });

    updatedProfile.technologies = this.technologies.value.map((tech: string) =>
      tech.trim()
    );

    if (this.avatarPreview) {
      updatedProfile.avatar = this.avatarPreview.toString();
    }

    if (Object.keys(updatedProfile).length === 0) {
      this.toastrService.info('Змін немає');
      return;
    }

    this.userProfileService
      .updateUserGeneralProfileInfo(updatedProfile)
      .subscribe({
        next: () => {
          Object.assign(this.userProfile, updatedProfile);

          this.userProfile.technologies =
            updatedProfile.technologies?.map((name) => ({ name })) || [];

          this.userProfile$.next(this.userProfile);
          this.toastrService.success('Профіль оновлено успішно');
          this.isGeneralEditMode = false;
        },
        error: () => {
          this.toastrService.error('Помилка при оновленні профілю');
        }
      });
  }

  get technologies(): FormArray<FormControl<string>> {
    return this.generalProfileForm.get('technologies') as FormArray<
      FormControl<string>
    >;
  }

  private createSocialsForm(socials: Socials): void {
    this.socialsForm = this.fb.group({});
    this.originalSocials = { ...socials };

    Object.keys(socials).forEach((key) => {
      this.socialsForm.addControl(key, this.fb.control(socials[key] || ''));
    });
  }

  enterEditMode(): void {
    this.isEditMode = true;
  }

  cancelEditMode(): void {
    this.createSocialsForm(this.originalSocials);
    this.isEditMode = false;
  }

  saveSocials(): void {
    if (this.socialsForm.invalid) return;

    const updatedSocials: Partial<Socials> = {};

    Object.keys(this.socialsForm.value).forEach((key) => {
      if (this.socialsForm.value[key] !== this.userProfile.socials[key]) {
        updatedSocials[key] = this.socialsForm.value[key] || null;
      }
    });

    if (Object.keys(updatedSocials).length === 0) {
      this.toastrService.info('Змін немає');
      return;
    }

    this.userProfileService
      .updateUserProfileSocialsInfo(updatedSocials as Socials)
      .subscribe(() => {
        Object.assign(this.userProfile.socials, updatedSocials);
        this.userProfile$.next(this.userProfile);

        this.toastrService.success('Соціальні мережі оновлено');
        this.isEditMode = false;
      });
  }

  unblockUser(id: number): void {
    this.usersService.blockOrUnblockCertainUser(id).subscribe(() => {
      this.blackListUsers = this.blackListUsers.filter(
        (user) => user.blocked_user.id !== id
      );
      this.toastrService.success('Користувач розблокований');
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

  onAvatarChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview = reader.result;
        this.generalProfileForm.patchValue({ avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  }

  objectKeys(obj: object | null | undefined): string[] {
    return obj ? Object.keys(obj) : [];
  }
}
