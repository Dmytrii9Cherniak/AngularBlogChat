import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserDataModel } from '../../../models/user/user.data.model';
import { UserProfileService } from '../../../services/user.profile.service';

@Component({
  selector: 'app-user-profile-data',
  templateUrl: './user-profile-data.component.html',
  styleUrls: ['./user-profile-data.component.scss']
})
export class UserProfileDataComponent implements OnInit {
  public profileForm: FormGroup;
  public isEditMode = false;
  private updatedAvatarFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private userProfileService: UserProfileService
  ) {}

  ngOnInit() {
    this.initializeForm();

    this.userProfileService.userProfileData.subscribe((value) => {
      if (value) {
        this.profileForm.patchValue(value);
      }
    });
  }

  initializeForm() {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(50)]],
      avatar: [''],
      gender: [''],
      birthday: [''],
      phone_number: [''],
      country: [''],
      time_zones: [''],
      business_email: ['', [Validators.email]]
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
      alert('Invalid file type. Only PNG, JPG, and WEBP are allowed.');
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      alert('File size must not exceed 1MB.');
      return;
    }

    this.updatedAvatarFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.profileForm.patchValue({ avatar: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  getAvatarUrl(): string {
    return this.profileForm.value.avatar
      ? `/assets/${this.profileForm.value.avatar}`
      : 'assets/images/no_profile_avatar.png';
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/no_profile_avatar.png';
  }

  updateProfile() {
    if (this.profileForm.invalid) return;

    const formData = new FormData();
    formData.append('username', this.profileForm.value.username);
    formData.append('gender', this.profileForm.value.gender);
    formData.append('birthday', this.profileForm.value.birthday);
    formData.append('phone_number', this.profileForm.value.phone_number);
    formData.append('country', this.profileForm.value.country);
    formData.append('time_zones', this.profileForm.value.time_zones);
    formData.append('business_email', this.profileForm.value.business_email);

    if (this.updatedAvatarFile) {
      formData.append('avatar', this.updatedAvatarFile);
    }

    this.userProfileService.updatePersonalUserProfileData(formData).subscribe({
      next: (res) => {
        alert('Profile updated successfully!');
        this.isEditMode = false;
        this.userProfileService.userProfileData.next(res);
      },
      error: (err) => {
        alert('Failed to update profile.');
        console.error(err);
      }
    });
  }
}
