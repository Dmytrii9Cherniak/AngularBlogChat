import { Component, OnInit } from '@angular/core';
import { UserDataModel } from '../../../models/user/user.data.model';
import { UserProfileService } from '../../../services/user.profile.service';

@Component({
  selector: 'app-user-profile-data',
  templateUrl: './user-profile-data.component.html',
  styleUrls: ['./user-profile-data.component.scss']
})
export class UserProfileDataComponent implements OnInit {
  public userProfileData: UserDataModel | null = null;
  private updatedAvatarFile: File | null = null;

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit() {
    this.userProfileService.userProfileData.subscribe((value) => {
      this.userProfileData = value;
    });
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
      if (this.userProfileData) {
        this.userProfileData.avatar = reader.result as string;
      }
    };
    reader.readAsDataURL(file);
  }

  updateProfile() {
    if (!this.userProfileData) return;

    const formData = new FormData();
    // formData.append('username', this.userProfileData.username);
    // formData.append('email', this.userProfileData.email);
    // formData.append('role', this.userProfileData.role);
    // formData.append('country', this.userProfileData.country);
    // formData.append('time_zones', this.userProfileData.time_zones);

    if (this.updatedAvatarFile) {
      formData.append('avatar', this.updatedAvatarFile);
    }

    this.userProfileService.updateUserProfilePersonalData(formData).subscribe({
      next: (res) => {
        console.log('Profile updated successfully:', res);
        alert('Profile updated!');
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        alert('Failed to update profile.');
      }
    });
  }
}
