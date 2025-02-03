import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ProjectsService } from '../../../services/projects.service';
import { AuthService } from '../../../services/auth.service';
import { UserDataModel } from '../../../models/user/user.data.model';
import { UserProfileService } from '../../../services/user.profile.service';
import { Project } from '../../../models/project/different.project.list.model';
import { ToastrService } from 'ngx-toastr';
import { Modal } from 'bootstrap';
import { CreateProjectModel } from '../../../models/project/create.project.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit, AfterViewInit {
  public projects: Project[] = [];
  public selectedProject: Project | null = null;
  public isAuthenticated$: Observable<boolean>;
  public userProfileData: UserDataModel | null = null;

  projectForm!: FormGroup;
  private createModal!: Modal | null;
  private deleteModal!: Modal | null;

  constructor(
    private projectsService: ProjectsService,
    private authService: AuthService,
    private userProfileService: UserProfileService,
    private toastrService: ToastrService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      technologies: this.fb.array([this.createTechnologyFormControl()])
    });

    this.loadProjects();
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.userProfileService.userProfileData.subscribe({
      next: (value) => {
        this.userProfileData = value;
      }
    });
  }

  get technologies(): FormArray {
    return this.projectForm.get('technologies') as FormArray;
  }

  createTechnologyFormControl(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required]
    });
  }

  addTechnology(): void {
    this.technologies.push(this.createTechnologyFormControl());
  }

  removeTechnology(index: number): void {
    if (index > 0) {
      this.technologies.removeAt(index);
    }
  }

  createOwnProject(): void {
    if (this.projectForm.invalid) {
      this.toastrService.error('Please fill in all required fields correctly.');
      return;
    }

    const formValue = this.projectForm.value;

    const technologiesArray: string[] = formValue.technologies.map(
      (tech: { name: string }) => tech.name
    );

    const newProject = new CreateProjectModel(
      formValue.name,
      formValue.description,
      technologiesArray
    );

    this.projectsService.createNewProject(newProject).subscribe({
      next: (response) => {
        const createdProject: Project = response as Project;
        this.projects.unshift(createdProject);
        this.toastrService.success('Project created successfully');

        const modalElement = document.getElementById('createProjectModal');
        if (modalElement) {
          const modalInstance =
            Modal.getInstance(modalElement) || new Modal(modalElement);
          modalInstance.hide();
        }
      },
      error: () => this.toastrService.error('Error creating project')
    });
  }

  ngAfterViewInit(): void {
    const createModalElement = document.getElementById('createProjectModal');
    this.createModal = createModalElement
      ? new Modal(createModalElement)
      : null;

    const deleteModalElement = document.getElementById('deleteProjectModal');
    this.deleteModal = deleteModalElement
      ? new Modal(deleteModalElement)
      : null;
  }

  openDeleteModal(project: Project): void {
    this.selectedProject = project;
    this.deleteModal?.show();
  }

  private loadProjects(): void {
    this.projectsService.getAllProjects().subscribe({
      next: (projects) => (this.projects = projects),
      error: () => this.toastrService.error('Failed to load projects')
    });
  }

  deleteExistingProject(id?: number): void {
    if (!id) return;

    this.projectsService.deleteExistingProject(id).subscribe({
      next: () => {
        this.toastrService.success('Project deleted successfully');
        this.projects = this.projects.filter((project) => project.id !== id);

        const modalElement = document.getElementById('deleteProjectModal');
        if (modalElement) {
          const modalInstance =
            Modal.getInstance(modalElement) || new Modal(modalElement);
          modalInstance.hide();
        }
      },
      error: () => this.toastrService.error('Failed to delete project')
    });
  }
}
