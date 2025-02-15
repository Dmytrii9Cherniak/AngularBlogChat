import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserProfileService } from '../../../services/user.profile.service';
import { ToastrService } from 'ngx-toastr';
import { UsersService } from '../../../services/users.service';
import { BehaviorSubject } from 'rxjs';
import { UserProfile } from '../../../models/profile/full.user.profile.data.model';
import { Socials } from '../../../models/profile/socials.profile.info.model';
import { passwordMatchValidator } from '../../../validators/password.match.validator';
import { ChangePasswordModel } from '../../../models/profile/change.password.model';

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

  socialsForm!: FormGroup;
  isEditMode: boolean = false;
  originalSocials!: Socials;

  blackListUsers: any[] = [];

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
      { validators: passwordMatchValidator() } // Кастомний валідатор для перевірки збігу паролів
    );

    this.userProfileService.getFullMyProfileData().subscribe((user) => {
      if (user) {
        this.userProfile = user;
        this.userProfile$.next(user);
        this.createSocialsForm(user.socials);
      }
    });

    // Отримання чорного списку користувачів
    this.usersService.getMyBlackUsersList().subscribe((users) => {
      this.blackListUsers = users;
    });
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
        updatedSocials[key] = this.socialsForm.value[key] || null; // ✅ Усуваємо `undefined`
      }
    });

    if (Object.keys(updatedSocials).length === 0) {
      this.toastrService.info('Змін немає');
      return;
    }

    this.userProfileService
      .updateUserProfileSocialsInfo(updatedSocials as Socials)
      .subscribe(() => {
        // ✅ Оновлюємо **тільки** поле `socials` без впливу на інші дані
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

  objectKeys(obj: object | null | undefined): string[] {
    return obj ? Object.keys(obj) : [];
  }
}

// new but not full func

// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import { UserProfileService } from '../../../services/user.profile.service';
// import { ToastrService } from 'ngx-toastr';
// import { UsersService } from '../../../services/users.service';
// import { Observable } from 'rxjs';
// import { UserProfile } from '../../../models/profile/full.user.profile.data.model';
// import { Socials } from '../../../models/profile/socials.profile.info.model';
//
// @Component({
//   selector: 'app-user-profile',
//   templateUrl: './user-profile-data.component.html',
//   styleUrls: ['./user-profile-data.component.scss']
// })
// export class UserProfileDataComponent implements OnInit {
//   userProfile$!: Observable<UserProfile>;
//   userProfile!: UserProfile; // ✅ Локальна копія профілю
//
//   socialsForm!: FormGroup;
//   isEditMode: boolean = false;
//   originalSocials!: Socials; // ✅ Зберігаємо оригінальні соцмережі для скасування змін
//
//   blackListUsers: any[] = [];
//
//   constructor(
//     private fb: FormBuilder,
//     private userProfileService: UserProfileService,
//     private toastrService: ToastrService,
//     private usersService: UsersService
//   ) {}
//
//   ngOnInit(): void {
//     // Отримання профілю користувача
//     this.userProfile$ = this.userProfileService.getFullMyProfileData();
//     this.userProfile$.subscribe((user) => {
//       if (user) {
//         this.userProfile = user;
//         this.createSocialsForm(user.socials);
//       }
//     });
//
//     // Отримання чорного списку користувачів
//     this.usersService.getMyBlackUsersList().subscribe((users) => {
//       this.blackListUsers = users;
//     });
//   }
//
//   // 🔧 Ініціалізація форми для соціальних мереж
//   private createSocialsForm(socials: Socials): void {
//     this.socialsForm = this.fb.group({});
//     this.originalSocials = { ...socials }; // Зберігаємо копію оригінальних соцмереж
//
//     Object.keys(socials).forEach((key) => {
//       this.socialsForm.addControl(key, this.fb.control(socials[key] || ''));
//     });
//   }
//
//   // 🎯 Включення режиму редагування
//   enterEditMode(): void {
//     this.isEditMode = true;
//   }
//
//   // ❌ Відміна змін і вихід з режиму редагування
//   cancelEditMode(): void {
//     this.createSocialsForm(this.originalSocials);
//     this.isEditMode = false;
//   }
//
//   // 💾 Збереження змін соціальних мереж
//   saveSocials(): void {
//     if (this.socialsForm.invalid) return;
//
//     const updatedSocials: Partial<Socials> = {};
//
//     // Визначаємо, які поля були змінені
//     Object.keys(this.socialsForm.value).forEach((key) => {
//       if (this.socialsForm.value[key] !== this.userProfile.socials[key]) {
//         updatedSocials[key] = this.socialsForm.value[key];
//       }
//     });
//
//     if (Object.keys(updatedSocials).length === 0) {
//       this.toastrService.info('Змін немає');
//       return;
//     }
//
//     this.userProfileService
//       .updateUserProfileSocialsInfo(updatedSocials as Socials)
//       .subscribe(() => {
//         this.updateProfileField('socials', {
//           ...this.userProfile.socials,
//           ...updatedSocials
//         });
//
//         this.toastrService.success('Соціальні мережі оновлено');
//         this.isEditMode = false;
//       });
//   }
//
//   // 🔄 Оновлення локального профілю
//   private updateProfileField(field: keyof UserProfile, newValue: any): void {
//     if (!this.userProfile) return;
//     this.userProfile = { ...this.userProfile, [field]: newValue };
//   }
//
//   // 🚫 Розблокування користувача
//   unblockUser(id: number): void {
//     this.usersService.blockOrUnblockCertainUser(id).subscribe(() => {
//       this.blackListUsers = this.blackListUsers.filter(
//         (user) => user.blocked_user.id !== id
//       );
//       this.toastrService.success('Користувач розблокований');
//     });
//   }
//
//   // 🔧 Метод отримання ключів об'єкта (для *ngFor)
//   objectKeys(obj: object | null | undefined): string[] {
//     return obj ? Object.keys(obj) : [];
//   }
// }

// old

// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { UserProfileService } from '../../../services/user.profile.service';
// import { ChangePasswordModel } from '../../../models/profile/change.password.model';
// import { ToastrService } from 'ngx-toastr';
// import { BlacklistUsersListModel } from '../../../models/blacklist/blacklist.users.list';
// import { passwordMatchValidator } from '../../../validators/password.match.validator';
// import { UsersService } from '../../../services/users.service';
// import { Observable } from 'rxjs';
// import { UserProfile } from '../../../models/profile/full.user.profile.data.model';
// import { Socials } from '../../../models/profile/socials.profile.info.model';
//
// @Component({
//   selector: 'app-user-profile',
//   templateUrl: './user-profile-data.component.html',
//   styleUrls: ['./user-profile-data.component.scss']
// })
// export class UserProfileDataComponent implements OnInit {
//   userProfile$!: Observable<UserProfile>;
//   userProfile!: UserProfile;
//   socialsForm!: FormGroup;
//   newPasswordForm!: FormGroup;
//   blackListUsers: BlacklistUsersListModel[] = [];
//   isEditMode: boolean = false;
//   changePasswordServerError: string | null = null;
//
//   passwordPattern: RegExp =
//     /^(?=.*[!@#$%^&*()_+}{":;'?/>.<,`~])(?=.*\d)[^\s]{8,}$/;
//
//   constructor(
//     private fb: FormBuilder,
//     private userProfileService: UserProfileService,
//     private toastrService: ToastrService,
//     private usersService: UsersService
//   ) {}
//
//   ngOnInit(): void {
//     this.newPasswordForm = this.fb.group(
//       {
//         current_password: ['', Validators.required],
//         new_password: [
//           '',
//           [Validators.required, Validators.pattern(this.passwordPattern)]
//         ],
//         confirm_password: ['', Validators.required]
//       },
//       { validators: passwordMatchValidator() }
//     );
//
//     this.usersService.getMyBlackUsersList().subscribe({
//       next: (value) => {
//         this.blackListUsers = value;
//       }
//     });
//
//     this.userProfile$ = this.userProfileService.getFullMyProfileData();
//     this.userProfile$.subscribe((user) => {
//       if (user) {
//         this.userProfile = user;
//         this.createSocialsForm(user.socials);
//       }
//     });
//   }
//
//   // 🏗️ Створення реактивної форми для соцмереж
//   private createSocialsForm(socials: Socials): void {
//     this.socialsForm = this.fb.group({});
//     if (socials) {
//       Object.keys(socials).forEach((key) => {
//         this.socialsForm.addControl(key, this.fb.control(socials[key] || ''));
//       });
//     }
//   }
//
//   // 💾 Збереження змін соцмереж
//   public saveSocials(): void {
//     if (this.socialsForm.invalid) return;
//
//     const updatedSocials: Partial<Socials> = {};
//
//     // Визначаємо, які соцмережі змінилися
//     Object.keys(this.socialsForm.controls).forEach((key) => {
//       if (this.socialsForm.controls[key].dirty) {
//         updatedSocials[key] = this.socialsForm.value[key];
//       }
//     });
//
//     if (Object.keys(updatedSocials).length === 0) return; // Немає змін
//
//     this.userProfileService
//       .updateUserProfileSocialsInfo(updatedSocials as Socials)
//       .subscribe({
//         next: () => {
//           if (this.userProfile?.socials) {
//             this.updateProfileField('socials', {
//               ...this.userProfile.socials,
//               ...updatedSocials
//             });
//           }
//           this.toastrService.success('Соціальні мережі оновлено');
//           this.isEditMode = false; // Вихід з режиму редагування після збереження
//         },
//         error: () => {
//           this.toastrService.error('Помилка оновлення соціальних мереж');
//         }
//       });
//   }
//
//   // ✅ Оновлення локального профілю
//   private updateProfileField(field: keyof UserProfile, newValue: any): void {
//     if (!this.userProfile) return;
//     this.userProfile = { ...this.userProfile, [field]: newValue };
//   }
//
//   // ✅ Розблокування користувача
//   unblockUser(id: number): void {
//     this.usersService.blockOrUnblockCertainUser(id).subscribe({
//       next: () => {
//         this.blackListUsers = this.blackListUsers.filter(
//           (el) => el.blocked_user.id !== id
//         );
//       }
//     });
//   }
//
//   // ✅ Зміна пароля
//   public changeProfilePassword() {
//     if (this.newPasswordForm.invalid) return;
//
//     const body = new ChangePasswordModel(
//       this.newPasswordForm.controls['current_password'].value,
//       this.newPasswordForm.controls['new_password'].value,
//       this.newPasswordForm.controls['confirm_password'].value
//     );
//
//     this.userProfileService.changeUserPassword(body).subscribe({
//       next: () => {
//         this.toastrService.success('Пароль змінено успішно');
//         this.changePasswordServerError = null;
//         this.newPasswordForm.reset();
//       },
//       error: (err) => {
//         if (err.error?.detail) {
//           this.changePasswordServerError = err.error.detail;
//         } else {
//           this.toastrService.error('Щось пішло не так');
//         }
//       }
//     });
//   }
//
//   // Отримуємо ключі об'єкта (соцмереж)
//   public objectKeys(obj: any): string[] {
//     return obj ? Object.keys(obj) : [];
//   }
// }
