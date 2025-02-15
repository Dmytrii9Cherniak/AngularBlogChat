import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ProjectsService } from '../../../services/projects.service';
import { AuthService } from '../../../services/auth.service';
import { UserDataModel } from '../../../models/user/user.data.model';
import { UserProfileService } from '../../../services/user.profile.service';
import { Project } from '../../../models/project/different.project.list.model';
import { ToastrService } from 'ngx-toastr';
import { CreateProjectModel } from '../../../models/project/create.project.model';
import { Observable } from 'rxjs';
import { Modal } from 'bootstrap';
import { UsersService } from '../../../services/users.service';
import { UsersListModel } from '../../../models/user/users.list.model';
import { CreateProjectInvite } from '../../../models/project/create.project.invite';

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
  public allUsersList: UsersListModel[] = [];
  public invitedUsers: UsersListModel[] = [];
  public selectedUsers: { [key: number]: boolean } = {};

  projectForm!: FormGroup;

  private modals: { [key: string]: Modal | null } = {
    create: null,
    delete: null,
    update: null,
    invite: null,
    confirmLeave: null
  };

  constructor(
    private projectsService: ProjectsService,
    private authService: AuthService,
    private userProfileService: UserProfileService,
    private toastrService: ToastrService,
    private usersService: UsersService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProjects();
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.userProfileService.userProfileData.subscribe({
      next: (value) => (this.userProfileData = value)
    });
  }

  private initForm(): void {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      technologies: this.fb.array([this.createTechnologyFormControl()])
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
    if (index > 0) this.technologies.removeAt(index);
  }

  ngAfterViewInit(): void {
    ['create', 'delete', 'update', 'invite', 'confirmLeave'].forEach(
      (modalName) => {
        const modalElement = document.getElementById(
          `${modalName}ProjectModal`
        );
        this.modals[modalName] = modalElement ? new Modal(modalElement) : null;
      }
    );
  }

  openModal(modalName: string, project?: Project): void {
    if (project) this.selectedProject = project;
    this.modals[modalName]?.show();
  }

  closeModal(modalName: string): void {
    this.modals[modalName]?.hide();
  }

  createOwnProject(): void {
    if (this.projectForm.invalid) {
      this.toastrService.error('Please fill in all required fields correctly.');
      return;
    }

    const formValue = this.projectForm.value;
    const newProject = new CreateProjectModel(
      formValue.name,
      formValue.description,
      formValue.technologies.map((tech: { name: string }) => tech.name)
    );

    this.projectsService.createNewProject(newProject).subscribe({
      next: (response) => {
        this.projects.unshift(response as Project);
        this.toastrService.success('Project created successfully');
        this.closeModal('create');
      },
      error: () => this.toastrService.error('Error creating project')
    });
  }

  updateExistingProject(): void {
    if (!this.selectedProject) return;

    const updatedProject = new CreateProjectModel(
      this.projectForm.value.name,
      this.projectForm.value.description,
      this.projectForm.value.technologies.map(
        (tech: { name: string }) => tech.name
      )
    );

    this.projectsService
      .updateExistingProject(this.selectedProject.id, updatedProject)
      .subscribe({
        next: () => {
          this.projects = this.projects.map((project) =>
            project.id === this.selectedProject?.id
              ? {
                ...project,
                ...updatedProject,
                technologies: updatedProject.technologies.map(
                  (name, index) => ({
                    id: index + 1,
                    name,
                    description: `Technology: ${name}`
                  })
                )
              }
              : project
          );
          this.toastrService.success('Project updated successfully');
          this.closeModal('update');
        },
        error: () => this.toastrService.error('Failed to update project')
      });
  }

  deleteExistingProject(id?: number): void {
    if (!id) return;

    this.projectsService.deleteExistingProject(id).subscribe({
      next: () => {
        this.projects = this.projects.filter((project) => project.id !== id);
        this.toastrService.success('Project deleted successfully');
        this.closeModal('delete');
      },
      error: () => this.toastrService.error('Failed to delete project')
    });
  }

  private loadProjects(): void {
    this.projectsService.getAllProjects().subscribe({
      next: (projects) => (this.projects = projects),
      error: () => this.toastrService.error('Failed to load projects')
    });
  }

  deleteSelectedUsersFromProject(projectId: number): void {
    const selectedUserIds = Object.keys(this.selectedUsers)
      .filter((userId) => this.selectedUsers[+userId])
      .map((userId) => +userId);

    if (selectedUserIds.length === 0) return;

    this.projectsService
      .deleteProjectMembers(projectId, selectedUserIds)
      .subscribe({
        next: () => {
          const project = this.projects.find((p) => p.id === projectId);
          if (project) {
            project.users = project.users.filter(
              (user) => !selectedUserIds.includes(user.id)
            );
          }
          this.selectedUsers = {};
        },
        error: () => this.toastrService.error('Error deleting users')
      });
  }

  inviteUser(user: UsersListModel): void {
    if (!this.selectedProject) return;

    const inviteProjectBody = new CreateProjectInvite(
      user.id,
      new Date(new Date().setDate(new Date().getDate() + 30))
        .toISOString()
        .split('T')[0],
      `Invitation to join project: ${this.selectedProject.name}`
    );

    this.projectsService
      .createProjectInvite(this.selectedProject.id, inviteProjectBody)
      .subscribe({
        next: () => {
          this.invitedUsers.push(user);
          this.toastrService.success(`${user.nickname} has been invited!`);
        },
        error: () => this.toastrService.error('Failed to invite user')
      });
  }

  leaveCertainProject(): void {
    if (!this.selectedProject?.id) return;

    const selectedProjectUsers = this.selectedProject.users.length;

    this.projectsService
      .leaveCertainProject(this.selectedProject.id)
      .subscribe({
        next: () => {
          this.projects = this.projects.map((project) =>
            project.id === this.selectedProject?.id
              ? {
                ...project,
                users: project.users.filter(
                  (user) => user.id !== this.userProfileData?.id
                )
              }
              : project
          );
          this.toastrService.success('You have left the project successfully');
          this.closeModal('confirmLeave');

          if (selectedProjectUsers === 1) {
            this.projects = this.projects.filter(
              (el) => el.id !== this.selectedProject?.id
            );
          }
        },
        error: () => this.toastrService.error('Failed to leave the project')
      });
  }

  canLeaveProject(project: Project): boolean {
    return !!(
      this.userProfileData &&
      project.users.some((user) => user.id === this.userProfileData!.id)
    );
  }

  openConfirmLeaveProjectModal(project: Project): void {
    this.selectedProject = project;
    this.modals['confirmLeave']?.show();
  }

  openDeleteModal(project: Project): void {
    this.selectedProject = project;
    this.modals['delete']?.show();
  }

  openEditModal(project: Project): void {
    this.selectedProject = project;

    this.projectForm.patchValue({
      name: project.name,
      description: project.description,
      technologies: project.technologies.map((tech) => ({ name: tech.name }))
    });

    this.modals['update']?.show();
  }

  openInviteModal(project: Project): void {
    this.selectedProject = project;
    this.usersService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsersList = users;
        this.modals['invite']?.show();
      },
      error: () => this.toastrService.error('Failed to load users.')
    });
  }
}
