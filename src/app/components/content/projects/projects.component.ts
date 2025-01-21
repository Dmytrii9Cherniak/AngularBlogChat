import { Component, OnInit } from '@angular/core';
import { ProjectsService } from '../../../services/projects.service';
import { FormBuilder, FormArray, Validators, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { UserDataModel } from '../../../models/user/user.data.model';
import { UserProfileService } from '../../../services/user.profile.service';
import { Project } from '../../../models/project/different.project.list.model';
import { CreateProjectModel } from '../../../models/project/create.project.model';
import { ModalManager } from '../../../OOP/modal.manager';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent extends ModalManager implements OnInit {
  public projects: Project[] = [];
  public selectedProject: Project | null = null;
  public createProjectForm: FormGroup;
  public updateProjectForm: FormGroup;
  public isAuthenticated$: Observable<boolean>;
  public userProfileData: UserDataModel | null = null;

  constructor(
    private projectsService: ProjectsService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userProfileService: UserProfileService,
    private toastrService: ToastrService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializeForms();
    this.loadProjects();
    this.listenToAuthentication();
    this.listenToUserProfileData();
  }

  private initializeForms(): void {
    this.createProjectForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      technologies: this.formBuilder.array([this.createTechnologyControl()])
    });

    this.updateProjectForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      technologies: this.formBuilder.array([])
    });
  }

  private createTechnologyControl(value: string = ''): FormGroup {
    return this.formBuilder.group({
      name: [value, Validators.required]
    });
  }

  get createTechnologies(): FormArray {
    return this.createProjectForm.get('technologies') as FormArray;
  }

  get updateTechnologies(): FormArray {
    return this.updateProjectForm.get('technologies') as FormArray;
  }

  private loadProjects(): void {
    this.projectsService.getAllProjects().subscribe({
      next: (projects) => (this.projects = projects),
      error: () => this.toastrService.error('Failed to load projects')
    });
  }

  private listenToAuthentication(): void {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  private listenToUserProfileData(): void {
    this.userProfileService.userProfileData.subscribe((data) => {
      this.userProfileData = data;
    });
  }

  addTechnology(formArray: FormArray): void {
    formArray.push(this.createTechnologyControl());
  }

  removeTechnology(formArray: FormArray, index: number): void {
    formArray.removeAt(index);
  }

  createOwnProject(): void {
    if (this.createProjectForm.invalid) return;

    const body: CreateProjectModel = {
      ...this.createProjectForm.value,
      technologies: this.createTechnologies.value.map(
        (tech: { name: string }) => tech.name
      )
    };

    this.projectsService.createNewProject(body).subscribe({
      next: (createdProject) => {
        this.projects = [
          this.mapCreatedProject(createdProject),
          ...this.projects
        ];
        this.toastrService.success('Project created successfully');
        this.closeModalAndResetForm(
          'create-project-modal',
          this.createProjectForm,
          this.createTechnologies
        );
      },
      error: () => this.toastrService.error('Error creating project')
    });
  }

  private mapCreatedProject(createdProject: any): Project {
    return {
      ...createdProject,
      technologies: createdProject.technologies || [],
      users: createdProject.users || [],
      creator: createdProject.creator
    };
  }

  openUpdateProjectModal(project: Project): void {
    this.selectedProject = project;

    this.updateProjectForm.patchValue({
      name: project.name,
      description: project.description
    });

    this.updateTechnologies.clear();
    project.technologies.forEach((tech) =>
      this.updateTechnologies.push(this.createTechnologyControl(tech.name))
    );

    this.openModal('update-project-modal');
  }

  addTechnologyToUpdateForm(): void {
    this.updateTechnologies.push(this.createTechnologyControl(''));
  }

  removeTechnologyFromUpdateForm(index: number): void {
    this.updateTechnologies.removeAt(index);
  }

  updateProject(): void {
    if (!this.selectedProject || this.updateProjectForm.invalid) {
      return;
    }

    const updatedProject = {
      ...this.updateProjectForm.value,
      technologies: this.updateTechnologies.value.map(
        (tech: { name: string }) => tech.name
      )
    };

    this.projectsService
      .updateExistingProject(this.selectedProject.id, updatedProject)
      .subscribe({
        next: () => {
          this.projects = this.projects.map((project) =>
            project.id === this.selectedProject!.id
              ? { ...project, ...updatedProject }
              : project
          );
          this.toastrService.success('Project updated successfully');
          this.closeModal('update-project-modal');
        },
        error: () => {
          this.toastrService.error('Error updating project');
        }
      });
  }

  openDeleteModal(project: Project): void {
    this.selectedProject = project;
    this.openModal('confirm-delete-project');
  }

  confirmDelete(): void {
    if (!this.selectedProject) {
      return;
    }

    this.projectsService
      .deleteExistingProject(this.selectedProject.id)
      .subscribe({
        next: () => {
          this.projects = this.projects.filter(
            (project) => project.id !== this.selectedProject!.id
          );
          this.toastrService.success('Project deleted successfully');
          this.closeModal('confirm-delete-project');
        },
        error: () => {
          this.toastrService.error('Failed to delete the project');
        }
      });
  }

  private closeModalAndResetForm(
    modalName: string,
    form: FormGroup,
    formArray: FormArray
  ): void {
    this.closeModal(modalName);
    form.reset();
    formArray.clear();
    this.addTechnology(formArray);
  }
}
