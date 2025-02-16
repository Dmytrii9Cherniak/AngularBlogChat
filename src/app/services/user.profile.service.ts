import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserDataModel } from '../models/user/user.data.model';
import { FriendsResponseModel } from '../models/user/friends.response.model';
import { ChangePasswordModel } from '../models/profile/change.password.model';
import { UserProfile } from '../models/profile/full.user.profile.data.model';
import { Socials } from '../models/profile/socials.profile.info.model';
import { UserEducationModel } from '../models/profile/user.education.model';
import { environment } from '../../environments/environment';
import { GeneralProfileModel } from '../models/profile/general.profile.model';
import { UserCertificatesModel } from '../models/profile/user.certificate.model';
import { Jobs } from '../models/profile/user.jobs.model';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  public userProfileData: BehaviorSubject<UserDataModel | null> =
    new BehaviorSubject<UserDataModel | null>(null);
  public fullUserProfileInfo: BehaviorSubject<UserProfile | null> =
    new BehaviorSubject<UserProfile | null>(null);

  constructor(private httpClient: HttpClient) {}

  public updateUserProfile(userData: UserDataModel): void {
    this.userProfileData.next(userData);
  }

  public getFullMyProfileData(): Observable<UserProfile> {
    return this.httpClient
      .get<UserProfile>(`${environment.apiUrl}/profile/`)
      .pipe(
        tap((value) => {
          this.fullUserProfileInfo.next(value);
        })
      );
  }

  public getUserData(): Observable<UserDataModel> {
    return this.httpClient
      .get<UserDataModel>(`${environment.apiUrl}/auth/user-data`)
      .pipe(
        tap((userData: UserDataModel) => {
          this.updateUserProfile(userData);
        })
      );
  }

  getAllFriendsList(): Observable<FriendsResponseModel> {
    return this.httpClient.get<FriendsResponseModel>(
      `${environment.apiUrl}/profile/friends/list`
    );
  }

  addNewFriend(friend_id: number) {
    const body = {
      expires_at: new Date(new Date().setDate(new Date().getDate() + 31)),
      description: 'Some description'
    };

    return this.httpClient.post(
      `${environment.apiUrl}/profile/friends/add/${friend_id}`,
      body
    );
  }

  removeUserFromMyFriends(friend_id: number) {
    return this.httpClient.delete(
      `${environment.apiUrl}/profile/friends/remove/${friend_id}`
    );
  }

  cancelFriendRequest(offer_code: string) {
    return this.httpClient.delete(
      `${environment.apiUrl}/profile/friends/delete-offer/${offer_code}`
    );
  }

  acceptOrDeclineFriendRequest(offer_code: string, choice: string) {
    const userFriendChoice = {
      status: choice
    };

    return this.httpClient.post(
      `${environment.apiUrl}/profile/friends/response/${offer_code}`,
      userFriendChoice
    );
  }

  // Change personal profile info endpoints

  public changeUserPassword(body: ChangePasswordModel) {
    return this.httpClient.put(
      `${environment.apiUrl}/auth/password/change`,
      body
    );
  }

  public deleteUserCertificates(id: string) {
    return this.httpClient
      .delete(`${environment.apiUrl}/profile/certificates/delete/${id}`)
      .pipe(
        tap(() => {
          const currentProfile = this.fullUserProfileInfo.getValue();
          if (currentProfile) {
            const updatedCertificates = currentProfile.certificates.filter(
              (cert) => cert !== id
            );
            this.updateProfileField('certificates', updatedCertificates);
          }
        })
      );
  }

  public createOrUpdateUserCertificates(body: UserCertificatesModel) {
    return this.httpClient
      .patch(`${environment.apiUrl}/profile/certificates/update`, body)
      .pipe(
        tap(() => {
          const currentProfile = this.fullUserProfileInfo.getValue();
          if (currentProfile) {
            const updatedCertificates = [...currentProfile.certificates, body];
            this.updateProfileField('certificates', updatedCertificates);
          }
        })
      );
  }

  public deleteUserEducation(educationName: string) {
    return this.httpClient
      .delete(`${environment.apiUrl}/profile/education/remove/${educationName}`)
      .pipe(
        tap(() => {
          const currentProfile = this.fullUserProfileInfo.getValue();
          if (currentProfile) {
            const updatedEducation = currentProfile.education.filter(
              (edu) => edu !== educationName
            );
            this.updateProfileField('education', updatedEducation);
          }
        })
      );
  }

  public createOrUpdateUserEducation(body: UserEducationModel) {
    return this.httpClient
      .patch(`${environment.apiUrl}/profile/education/update`, body)
      .pipe(
        tap(() => {
          const currentProfile = this.fullUserProfileInfo.getValue();
          if (currentProfile) {
            const updatedEducation = [...currentProfile.education, body];
            this.updateProfileField('education', updatedEducation);
          }
        })
      );
  }

  public updateUserGeneralProfileInfo(body: GeneralProfileModel) {
    return this.httpClient
      .patch(`${environment.apiUrl}/profile/general/update`, body)
      .pipe(
        tap(() => {
          const currentProfile = this.fullUserProfileInfo.getValue();
          if (currentProfile) {
            const updatedTechnologies =
              body.technologies?.map((tech) => ({ name: tech })) ??
              currentProfile.technologies;

            this.fullUserProfileInfo.next({
              ...currentProfile,
              ...body,
              technologies: updatedTechnologies
            });
          }
        })
      );
  }

  public deleteUserJobs(body: { company: number; position: string }) {
    return this.httpClient
      .request('DELETE', `${environment.apiUrl}/profile/jobs/remove`, {
        body // ✅ Передаємо компанію як ID та позицію як текст
      })
      .pipe(
        tap(() => {
          const currentProfile = this.fullUserProfileInfo.getValue();
          if (currentProfile) {
            const updatedJobs = currentProfile.jobs.filter(
              (job) =>
                job.company?.id !== body.company ||
                job.position !== body.position
            );
            this.updateProfileField('jobs', updatedJobs);
          }
        })
      );
  }

  public createOrUpdateUserJobs(body: Jobs) {
    return this.httpClient
      .patch(`${environment.apiUrl}/profile/jobs/update`, body)
      .pipe(
        tap(() => {
          const currentProfile = this.fullUserProfileInfo.getValue();
          if (currentProfile) {
            const updatedJobs = [...currentProfile.jobs, body];
            this.updateProfileField('jobs', updatedJobs);
          }
        })
      );
  }

  public updateUserProfileSocialsInfo(body: Socials) {
    return this.httpClient
      .patch(`${environment.apiUrl}/profile/socials/update`, body)
      .pipe(
        tap(() => {
          this.updateProfileField('socials', body);
        })
      );
  }

  private updateProfileField(field: keyof UserProfile, newValue: any) {
    const currentProfile = this.fullUserProfileInfo.getValue();
    if (!currentProfile) return;

    const updatedProfile = { ...currentProfile, [field]: newValue };
    this.fullUserProfileInfo.next(updatedProfile);
  }
}
