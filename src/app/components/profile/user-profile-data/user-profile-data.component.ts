import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { BlacklistUsersListModel } from '../../../models/blacklist/blacklist.users.list';
import { Jobs } from '../../../models/profile/user.jobs.model';
import { TranslateService } from '@ngx-translate/core';
import { ModalManager } from '../../../OOP/modal.manager';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile-data.component.html',
  styleUrls: ['./user-profile-data.component.scss']
})
export class UserProfileDataComponent extends ModalManager implements OnInit {
  @ViewChild('passwordInput') passwordInput!: ElementRef;

  newPasswordForm: FormGroup;
  changePasswordServerError: string | null = null;
  userProfile$ = new BehaviorSubject<UserProfile | null>(null);
  userProfile!: UserProfile;

  avatarPreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  socialsForm!: FormGroup;
  isEditSocialsMode: boolean = false;
  originalSocials!: Socials;

  blackListUsers: BlacklistUsersListModel[] = [];

  generalProfileForm!: FormGroup;
  isGeneralEditMode: boolean = false;

  newJobForm!: FormGroup;

  isAddingJob = false;

  newEducationForm!: FormGroup;
  isAddingEducation: boolean = false;

  today: string = new Date().toISOString().split('T')[0];

  newCertificateForm!: FormGroup;
  isAddingCertificate = false;
  selectedCertificateFile: File | null = null;

  isFreezeAccountButtonDisabled: boolean = true;

  passwordPattern: RegExp =
    /^(?=.*[!@#$%^&*()_+}{":;'?/>.<,`~])(?=.*\d)[^\s]{8,}$/;

  constructor(
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private toastrService: ToastrService,
    private usersService: UsersService,
    private translate: TranslateService,
    private authService: AuthService,
    private router: Router
  ) {
    super();
    translate.setDefaultLang('en');
    translate.use(localStorage.getItem('lang') || 'en');
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

  ngOnInit(): void {
    this.userProfileService.getFullMyProfileData().subscribe((user) => {
      if (user) {
        this.userProfile = user;
        this.userProfile$.next(user);
        this.createSocialsForm(user.socials);
        this.createGeneralProfileForm(user);
      }
    });

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

    this.newJobForm = this.fb.group({
      companyName: ['', Validators.required],
      position: ['', Validators.required],
      started_at: ['', [Validators.required, this.futureDateValidator()]],
      ended_at: [{ value: '', disabled: false }],
      description: [''],
      isCurrentlyEmployed: [false]
    });

    this.newEducationForm = this.fb.group({
      university: ['', Validators.required],
      specialty: ['', Validators.required],
      started_at: ['', [Validators.required, this.futureDateValidator()]],
      ended_at: [{ value: '', disabled: false }],
      isCurrentlyStudying: [false]
    });

    this.newCertificateForm = this.fb.group({
      title: [''],
      organization: [''],
      issued_at: [''],
      description: ['']
    });

    this.newEducationForm
      .get('isCurrentlyStudying')
      ?.valueChanges.subscribe((checked) => {
        const endedAtControl = this.newEducationForm.get('ended_at');
        if (checked) {
          endedAtControl?.disable();
          endedAtControl?.reset();
        } else {
          endedAtControl?.enable();
        }
      });

    this.newJobForm
      .get('isCurrentlyEmployed')
      ?.valueChanges.subscribe((checked) => {
        const endedAtControl = this.newJobForm.get('ended_at');
        if (checked) {
          endedAtControl?.disable();
          endedAtControl?.reset();
        } else {
          endedAtControl?.enable();
        }
      });

    this.usersService.getMyBlackUsersList().subscribe((users) => {
      this.blackListUsers = users;
    });
  }

  private futureDateValidator() {
    return (control: FormControl) => {
      if (control.value && new Date(control.value) > new Date()) {
        return { futureDate: true };
      }
      return null;
    };
  }

  toggleAddCertificate(): void {
    this.isAddingCertificate = true;
  }

  cancelAddCertificate(): void {
    this.newCertificateForm.reset();
    this.isAddingCertificate = false;
  }

  onCertificateFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedCertificateFile = file;
    }
  }

  saveNewCertificate(): void {
    if (this.newCertificateForm.invalid) {
      this.toastrService.error('Будь ласка, заповніть усі обов’язкові поля.');
      return;
    }

    const formData = new FormData();
    formData.append('title', this.newCertificateForm.value.title);
    formData.append('organization', this.newCertificateForm.value.organization);
    formData.append('issued_at', this.newCertificateForm.value.issued_at);

    if (this.newCertificateForm.value.description) {
      formData.append('description', this.newCertificateForm.value.description);
    }

    if (this.selectedCertificateFile) {
      formData.append('photo', this.selectedCertificateFile);
    }

    this.sendCertificate(formData);
  }

  private sendCertificate(certFormData: FormData): void {
    this.userProfileService
      .createOrUpdateUserCertificates(certFormData)
      .subscribe({
        next: (createdCert) => {
          this.userProfile.certificates.push(createdCert);
          this.userProfile$.next(this.userProfile);
          this.toastrService.success('Сертифікат додано успішно!');
          this.newCertificateForm.reset();
          this.isAddingCertificate = false;
          this.selectedCertificateFile = null;
        },
        error: () => {
          this.toastrService.error('Помилка при додаванні сертифіката.');
        }
      });
  }

  deleteCertificate(id: string): void {
    if (!id) {
      this.toastrService.error('Помилка: ID сертифіката не знайдено.');
      return;
    }

    if (!confirm('Ви впевнені, що хочете видалити цей сертифікат?')) {
      return;
    }

    this.userProfileService.deleteUserCertificate(id).subscribe({
      next: () => {
        this.userProfile.certificates = this.userProfile.certificates.filter(
          (cert) => cert.id !== id
        );
        this.userProfile$.next(this.userProfile);
        this.toastrService.success('Сертифікат успішно видалено!');
      },
      error: () => {
        this.toastrService.error('Помилка при видаленні сертифіката.');
      }
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

  deleteJob(id?: number, position?: string): void {
    if (!id) {
      this.toastrService.error('Помилка: ID роботи не знайдено.');
      return;
    }

    if (!confirm(`Ви впевнені, що хочете видалити роботу "${position}"?`)) {
      return;
    }

    this.userProfileService.deleteUserJobs(id).subscribe({
      next: () => {
        this.userProfile.jobs = this.userProfile.jobs.filter(
          (j) => j.id !== id
        );
        this.userProfile$.next(this.userProfile);
        this.toastrService.success('Роботу успішно видалено!');
      },
      error: () => {
        this.toastrService.error('Помилка при видаленні роботи.');
      }
    });
  }

  toggleAddJob(): void {
    this.isAddingJob = true;
  }

  toggleAddEducation(): void {
    this.isAddingEducation = true;
  }

  saveNewEducation(): void {
    if (this.newEducationForm.invalid) {
      this.toastrService.error('Будь ласка, заповніть усі обов’язкові поля.');
      return;
    }

    let newEducation: any = {
      university: this.newEducationForm.value.university,
      specialty: this.newEducationForm.value.specialty,
      started_at: this.newEducationForm.value.started_at
    };

    if (!this.newEducationForm.value.isCurrentlyStudying) {
      newEducation.ended_at = this.newEducationForm.value.ended_at;
    }

    this.userProfileService
      .createOrUpdateUserEducation(newEducation)
      .subscribe({
        next: (createdEducation) => {
          this.userProfile.education.push(createdEducation);
          this.userProfile$.next(this.userProfile);
          this.toastrService.success('Освіту додано успішно!');
          this.newEducationForm.reset();
          this.isAddingEducation = false;
        },
        error: () => {
          this.toastrService.error('Помилка при додаванні освіти.');
        }
      });
  }

  deleteEducation(id?: number, university?: string): void {
    if (!id) {
      this.toastrService.error('Помилка: ID освіти не знайдено.');
      return;
    }

    if (!confirm(`Ви впевнені, що хочете видалити освіту "${university}"?`)) {
      return;
    }

    this.userProfileService.deleteUserEducation(id).subscribe({
      next: () => {
        this.userProfile.education = this.userProfile.education.filter(
          (edu) => edu.id !== id
        );
        this.userProfile$.next(this.userProfile);
        this.toastrService.success('Освіту успішно видалено!');
      },
      error: () => {
        this.toastrService.error('Помилка при видаленні освіти.');
      }
    });
  }

  cancelAddEducation(): void {
    this.newEducationForm.reset();
    this.isAddingEducation = false;
  }

  saveNewJob(): void {
    if (this.newJobForm.invalid) {
      this.toastrService.error('Будь ласка, заповніть усі обов’язкові поля.');
      return;
    }

    let newJob: any = {
      company: this.newJobForm.value.companyName,
      position: this.newJobForm.value.position,
      started_at: this.newJobForm.value.started_at,
      ended_at: this.newJobForm.value.isCurrentlyEmployed
        ? null
        : this.newJobForm.value.ended_at,
      description: this.newJobForm.value.description
    };

    Object.keys(newJob).forEach((key) => {
      if (!newJob[key]) delete newJob[key];
    });

    this.userProfileService.createOrUpdateUserJobs(newJob).subscribe({
      next: (createdJob: Jobs) => {
        this.userProfile.jobs.push({
          id: createdJob.id,
          company: { name: newJob.company, id: createdJob?.company?.id },
          position: createdJob.position,
          started_at: createdJob.started_at,
          ended_at: createdJob.ended_at,
          description: createdJob.description
        });

        this.userProfile$.next(this.userProfile);
        this.toastrService.success('Роботу додано успішно!');
        this.newJobForm.reset();
        this.isAddingJob = false;
      },
      error: () => {
        this.toastrService.error('Помилка при додаванні роботи.');
      }
    });
  }

  cancelAddJob(): void {
    this.newJobForm.reset();
    this.isAddingJob = false;
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

  enterEditSocialsMode(): void {
    this.isEditSocialsMode = true;
  }

  cancelEditSocialsMode(): void {
    this.createSocialsForm(this.originalSocials);
    this.isEditSocialsMode = false;
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
        this.isEditSocialsMode = false;
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

  resetUserAccount() {
    const password = this.passwordInput.nativeElement.value;

    this.userProfileService.resetUserAccount(password).subscribe({
      next: () => {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
        this.toastrService.success(`Акаунт видалено успішно`);
      },
      error: (err) => {
        this.toastrService.error(err);
      }
    });
  }

  deleteUserAccount() {
    this.userProfileService.deleteUserAccount().subscribe({
      next: () => {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
        this.toastrService.success(`Акаунт видалено успішно`);
      }
    });
  }

  onPasswordInput() {
    this.isFreezeAccountButtonDisabled =
      !this.passwordInput.nativeElement.value;
  }

  objectKeys(obj: object | null | undefined): string[] {
    return obj ? Object.keys(obj) : [];
  }
}
