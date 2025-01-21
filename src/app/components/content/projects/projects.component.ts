import { Component, OnInit } from '@angular/core';
import { ProjectsService } from '../../../services/projects.service';
import { FormBuilder, FormArray, Validators } from '@angular/forms';
import { Project } from '../../../models/project/create.project.model';
import { Observable } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { FormHelper } from '../../../helpers/form-helper';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  public isCreateProject: boolean = false;
  public isAuthenticated: Observable<boolean>;
  public projects: Project[];
  public formHelper: FormHelper;

  constructor(
    private projectsService: ProjectsService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.formHelper = new FormHelper(this.formBuilder);
  }

  ngOnInit() {
    this.formHelper.createProjectForm();

    this.isAuthenticated = this.authService.isAuthenticated$;

    this.projectsService.getAllProjects().subscribe({
      next: (value: Project[]) => {
        console.log(value);
        this.projects = value;
      }
    });
  }

  get technologies(): FormArray {
    return this.formHelper.form.get('technologies') as FormArray;
  }

  addTechnology(): void {
    this.technologies.push(this.formBuilder.control('', Validators.required));
  }

  removeTechnology(index: number): void {
    this.technologies.removeAt(index);
  }

  createOwnProject() {
    if (this.formHelper.form.invalid) {
      console.log('Form is invalid');
      return;
    }

    const body: Project = {
      ...this.formHelper.form.value,
      technologies: this.technologies.value
    };

    this.projectsService.createNewProject(body).subscribe({
      next: (value) => {
        console.log('Project created:', value);
        this.resetForm();
      },
      error: (err) => {
        console.error('Error creating project:', err);
      }
    });
  }

  createNewProject() {
    this.isCreateProject = !this.isCreateProject;
  }

  resetForm(): void {
    this.formHelper.form.reset();
    this.technologies.clear();
    this.addTechnology();
    this.isCreateProject = false;
  }
}
