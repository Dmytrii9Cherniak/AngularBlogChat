import { Component, OnInit } from '@angular/core';
import { AnnouncementsService } from '../../../services/announcements.service';
import { Observable } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { ModalManager } from '../../../OOP/modal.manager';
import { NewAnnouncementModel } from '../../../models/announcements/new.announcement.model';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';
import { ProjectsService } from '../../../services/projects.service';
import { map } from 'rxjs/operators';
import { UserDataModel } from '../../../models/user/user.data.model';
import { UserProfileService } from '../../../services/user.profile.service';
import { Project } from '../../../models/project/different.project.list.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.scss']
})
export class AnnouncementsComponent extends ModalManager implements OnInit {
  public isAuthenticated$: Observable<boolean>;
  public listOfAnnouncements: NewAnnouncementModel[];
  public isLoading: boolean = true;
  public newAnnouncementForm: FormGroup;
  public userProfileData: UserDataModel | null = null;
  public myProjects: Project[] = [];
  public updateAnnouncementForm: FormGroup;
  public searchItemsForm: FormGroup;
  public leftFiltersForm: FormGroup;
  public selectedAnnouncement: NewAnnouncementModel | null = null;
  public isSearching: boolean = false;

  constructor(
    private announcementService: AnnouncementsService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private projectService: ProjectsService,
    private userProfileService: UserProfileService,
    private toastrService: ToastrService
  ) {
    super();
  }

  ngOnInit(): void {
    this.userProfileService.userProfileData.subscribe({
      next: (value) => {
        this.userProfileData = value;

        this.projectService.allProjectList
          .pipe(
            map((projects) =>
              projects.filter(
                (p: Project) => p.creator.id === this.userProfileData?.id
              )
            )
          )
          .subscribe((filteredProjects) => {
            this.myProjects = filteredProjects;
          });
      }
    });

    this.searchItemsForm = this.formBuilder.group({
      search: ['', Validators.required]
    });

    this.newAnnouncementForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      job_titles: this.formBuilder.array([]),
      technologies: this.formBuilder.array([]),
      project: ['', Validators.required]
    });

    this.updateAnnouncementForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      job_titles: this.formBuilder.array([]),
      technologies: this.formBuilder.array([])
    });

    this.isAuthenticated$ = this.authService.isAuthenticated$;

    this.loadAllAnnouncements();

    this.searchItemsForm
      .get('search')
      ?.valueChanges.subscribe((value: string) => {
        const trimmedValue = value.trim();

        if (!trimmedValue) {
          this.loadAllAnnouncements();
        }
      });

    fetch('assets/json/technologies.json')
      .then((res) => res.json())
      .then((data) => console.log(data));
  }

  get job_titles(): FormArray {
    return this.newAnnouncementForm.get('job_titles') as FormArray;
  }

  get technologies(): FormArray {
    return this.newAnnouncementForm.get('technologies') as FormArray;
  }

  get updateJobTitles(): FormArray {
    return this.updateAnnouncementForm.get('job_titles') as FormArray;
  }

  get updateTechnologies(): FormArray {
    return this.updateAnnouncementForm.get('technologies') as FormArray;
  }

  addUpdateJobTitle(): void {
    this.updateJobTitles.push(new FormControl('', Validators.required));
  }

  removeUpdateJobTitle(index: number): void {
    if (this.updateJobTitles.length > 0) this.updateJobTitles.removeAt(index);
  }

  addUpdateTechnology(): void {
    this.updateTechnologies.push(new FormControl('', Validators.required));
  }

  removeUpdateTechnology(index: number): void {
    if (this.updateTechnologies.length > 0)
      this.updateTechnologies.removeAt(index);
  }

  addJobTitle(): void {
    this.job_titles.push(new FormControl('', Validators.required));
  }

  removeJobTitle(index: number): void {
    if (this.job_titles.length > 0) this.job_titles.removeAt(index);
  }

  addTechnology(): void {
    this.technologies.push(new FormControl('', Validators.required));
  }

  removeTechnology(index: number): void {
    if (this.technologies.length > 0) this.technologies.removeAt(index);
  }

  createNewAnnouncement() {
    if (this.newAnnouncementForm.invalid) {
      return;
    }

    const formData = this.newAnnouncementForm.value;
    const body: NewAnnouncementModel = new NewAnnouncementModel(
      formData.title,
      formData.description,
      formData.job_titles,
      formData.technologies,
      formData.project
    );

    this.announcementService.createNewAnnouncement(body).subscribe({
      next: (createdAnnouncement) => {
        this.listOfAnnouncements = [
          ...this.listOfAnnouncements,
          createdAnnouncement
        ];
        this.closeModal('create_project_announcement');
        this.newAnnouncementForm.reset();
        this.toastrService.success('Оголошення успішно створено');
      },
      error: () => {
        this.toastrService.error('Помилка при створенні оголошення');
      }
    });
  }

  deleteProjectAnnouncement(id: number) {
    this.announcementService.deleteProjectAnnouncement(id).subscribe({
      next: () => {
        this.listOfAnnouncements = this.listOfAnnouncements.filter(
          (el) => el.id !== id
        );
        this.toastrService.success('Оголошення успішно видалено');
      },
      error: () => {
        this.toastrService.error('Помилка при видаленні оголошення');
      }
    });
  }

  openUpdateModal(announcement: NewAnnouncementModel) {
    this.selectedAnnouncement = announcement;

    this.updateAnnouncementForm.patchValue({
      title: announcement.title,
      description: announcement.description
    });

    this.setUpdateFormArray('job_titles', announcement.job_titles);
    this.setUpdateFormArray('technologies', announcement.technologies);

    this.openModal('update_project_announcement');
  }

  private setUpdateFormArray(
    fieldName: 'job_titles' | 'technologies',
    values: string[] | undefined
  ) {
    const formArray = this.updateAnnouncementForm.get(fieldName) as FormArray;
    formArray.clear();

    (values || []).forEach((value) => {
      formArray.push(new FormControl(value, Validators.required));
    });
  }

  updateProjectAnnouncement() {
    if (
      this.updateAnnouncementForm.invalid ||
      !this.selectedAnnouncement ||
      this.selectedAnnouncement.id === undefined
    ) {
      return;
    }

    const updatedData: NewAnnouncementModel = {
      ...this.selectedAnnouncement,
      ...this.updateAnnouncementForm.value
    };

    this.announcementService
      .updateProjectAnnouncement(this.selectedAnnouncement.id, updatedData)
      .subscribe({
        next: (updatedAnnouncement) => {
          this.listOfAnnouncements = this.listOfAnnouncements.map((a) =>
            a.id === updatedAnnouncement.id ? updatedAnnouncement : a
          );

          this.closeModal('update_project_announcement');
          this.toastrService.success('Оголошення оновлено!');
        },
        error: () => {
          this.toastrService.error('Помилка при оновленні оголошення');
        }
      });
  }

  public searchTitleAnnouncement(): void {
    const title = this.searchItemsForm.get('search')?.value?.trim();

    if (!title) {
      this.clearSearchForm();
      return;
    }

    this.isSearching = true;
    this.announcementService.getAllAnnouncements(title).subscribe({
      next: (value) => {
        this.listOfAnnouncements = value;
        this.isLoading = false;
        this.isSearching = false;
      },
      error: () => {
        this.toastrService.error('Помилка при пошуку оголошень');
        this.isLoading = false;
        this.isSearching = false;
      }
    });
  }

  private loadAllAnnouncements(): void {
    this.isLoading = true;
    this.announcementService.getAllAnnouncements().subscribe({
      next: (value: any) => {
        this.listOfAnnouncements = value.results;
        this.isLoading = false;
        this.isSearching = false;
      },
      error: () => {
        this.toastrService.error('Помилка при завантаженні оголошень');
        this.isLoading = false;
        this.isSearching = false;
      }
    });
  }

  public clearSearchForm(): void {
    this.searchItemsForm.controls['search'].setValue('');
    this.loadAllAnnouncements();
  }
}
