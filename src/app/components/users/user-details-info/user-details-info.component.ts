import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserProfileService } from '../../../services/user.profile.service';
import { UserProfile } from '../../../models/profile/full.user.profile.data.model';
import { ModalManager } from '../../../OOP/modal.manager';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReviewUserModel } from '../../../models/review.user.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-details-info',
  templateUrl: './user-details-info.component.html',
  styleUrls: ['./user-details-info.component.scss']
})
export class UserDetailsInfoComponent extends ModalManager implements OnInit {
  public isAuthenticated$: Observable<boolean>;
  public user$: Observable<UserProfile>;
  public userReviewForm: FormGroup;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private userProfileService: UserProfileService,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastrService: ToastrService
  ) {
    super();
  }

  ngOnInit(): void {
    this.isAuthenticated$ = this.authService.isAuthenticated$;

    this.userReviewForm = this.formBuilder.group({
      reaction: ['', Validators.required],
      review: ['', [Validators.required]],
      project: [''],
      university: [''],
      company: ['']
    });

    const userId = this.userId;
    if (userId !== null) {
      this.user$ = this.userProfileService.getOtherUserProfileInfo(userId);
    }
  }

  get userId(): number | null {
    return Number(this.route.snapshot.paramMap.get('id')) || null;
  }

  navigateToChat(userId: number, username: string): void {
    this.router.navigate(['/chat'], { queryParams: { userId, username } });
  }

  submitReview(): void {
    if (!this.userId) {
      return;
    }

    const formValues = this.userReviewForm.value;
    const reviewPayload = new ReviewUserModel({
      reaction: formValues.reaction,
      review: formValues.review,
      project: formValues.project?.trim() || undefined,
      university: formValues.university?.trim() || undefined,
      company: formValues.company?.trim() || undefined
    });

    this.userProfileService
      .createNewUserProfileReview(this.userId, reviewPayload)
      .subscribe({
        next: () => {
          this.toastrService.success('Відгук успішно написано');
          this.closeModal('create_profile_review');
        },
        error: (err) => {
          this.toastrService.error('Щось пішло не так', err);
        }
      });
  }

  deleteUserReview(id: number) {
    if (!this.userId) return;
    this.userProfileService
      .deleteNewUserProfileReview(this.userId, id)
      .subscribe({
        next: () => {
          this.toastrService.success('Відгук успішно написано');
        },
        error: (err) => {
          this.toastrService.error('Щось пішло не так', err);
        }
      });
  }
}
