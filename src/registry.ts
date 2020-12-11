import {Project} from "./models";
import {checkDataDirectory, loadProjects, saveBranchHistory, saveProjects} from "./store";
import config from "./config";

export interface IProjectRegistry {
  getById(id: string): Project | undefined;

  add(project: Project): void;

  save(): void;

  load(): void;
}

export class ProjectRegistry implements IProjectRegistry {
  private projects: Map<string, Project> = new Map<string, Project>();

  constructor() {
    checkDataDirectory();
    this.load();
  }

  add(project: Project): void {
    if (project.id) {
      this.projects.set(project.id, project);
    }
  }

  all(): Project[] {
    return [...this.projects.values()];
  }

  getById(id: string): Project | undefined {
    return this.projects.get(id);
  }

  save(): void {
    saveProjects(this.projects.values(), config.dataDir);
    for (const project of this.projects.values()) {
      for (const branch of project.branches) {
        saveBranchHistory(branch, config.dataDir);
      }
    }
  }

  load(): void {
    const projects = loadProjects(config.dataDir);
    for (const project of projects) {
      this.projects.set(project.id, project);
    }
  }
}