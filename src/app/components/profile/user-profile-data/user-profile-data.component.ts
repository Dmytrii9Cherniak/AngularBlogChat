import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UserDataModel } from '../../../models/user/user.data.model';
import { UserProfileService } from '../../../services/user.profile.service';
import { ToastrService } from 'ngx-toastr';
import { FormHelper } from '../../../helpers/form-helper';

@Component({
  selector: 'app-user-profile-data',
  templateUrl: './user-profile-data.component.html',
  styleUrls: ['./user-profile-data.component.scss']
})
export class UserProfileDataComponent implements OnInit {
  public formHelper: FormHelper;
  public isEditMode = false;
  private updatedAvatarFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private toastrServie: ToastrService
  ) {
    this.formHelper = new FormHelper(this.fb);
  }

  ngOnInit() {
    this.formHelper.createUpdateUserProfileDataForm();

    this.userProfileService.userProfileData.subscribe((value) => {
      if (value) {
        this.formHelper.form.patchValue({
          ...value,
          business_email: value.socials?.business_email || '' // Завантажуємо business_email
        });
      }
    });
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  onAvatarChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const validExtensions = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validExtensions.includes(file.type)) {
      this.toastrServie.info(
        'Невалидний тип фото. Лише PNG, JPG та WEBP дозволені формати.'
      );
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      this.toastrServie.info('Максимальний розмір фото - 1 мб');
      return;
    }

    this.updatedAvatarFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.formHelper.form.patchValue({ avatar: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  getAvatarUrl(): string {
    return this.formHelper.form.value.avatar
      ? `/assets/${this.formHelper.form.value.avatar}`
      : 'assets/images/no_profile_avatar.png';
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/no_profile_avatar.png';
  }

  updateProfile() {
    if (this.formHelper.form.invalid) return;

    const updatedFields = this.getChangedFields();
    const formData = new FormData();

    Object.keys(updatedFields).forEach((key) => {
      if (key === 'socials') {
        const socials = updatedFields[key] as UserDataModel['socials'];
        Object.keys(socials).forEach((socialKey) => {
          const key = socialKey as keyof UserDataModel['socials'];
          formData.append(`socials.${key}`, socials[key] || '');
        });
      } else {
        formData.append(
          key,
          updatedFields[key as keyof UserDataModel] as string
        );
      }
    });

    if (this.updatedAvatarFile) {
      formData.append('avatar', this.updatedAvatarFile);
    }

    this.userProfileService.updatePersonalUserProfileData(formData).subscribe({
      next: () => {
        this.toastrServie.success('Дані профілю були успішно оновлені');
        this.isEditMode = false;

        this.userProfileService.userProfileData.next({
          ...this.userProfileService.userProfileData.value!,
          ...updatedFields
        });
      },
      error: (err) => {
        this.toastrServie.error('Помилка при оновлені даних');
        console.error(err);
      }
    });
  }

  getChangedFields(): Partial<UserDataModel> {
    const updatedFields: Partial<UserDataModel> = {};

    Object.keys(this.formHelper.form.controls).forEach((key) => {
      const originalValue =
        this.userProfileService.userProfileData.value?.[
          key as keyof UserDataModel
        ];
      const currentValue = this.formHelper.form.get(key)?.value;

      if (key === 'socials') {
        const originalSocials = originalValue as UserDataModel['socials'];
        const currentSocials = currentValue as UserDataModel['socials'];
        const socials: Partial<UserDataModel['socials']> = {};

        Object.keys(currentSocials).forEach((socialKey) => {
          const socialValue =
            currentSocials[socialKey as keyof UserDataModel['socials']];
          if (
            socialValue !==
            originalSocials?.[socialKey as keyof UserDataModel['socials']]
          ) {
            socials[socialKey as keyof UserDataModel['socials']] =
              socialValue || null;
          }
        });

        if (Object.keys(socials).length > 0) {
          updatedFields.socials = socials as UserDataModel['socials'];
        }
      } else if (currentValue !== originalValue) {
        updatedFields[key as keyof UserDataModel] = currentValue;
      }
    });

    return updatedFields;
  }
}
