import {Project} from "./models";
import {checkDataDirectory, loadProjects, saveBranchHistory, saveProjects} from "./store";
import config from "./config";
import {VersionRegisterError} from "./errors";


export interface IProjectRegistry {
  getById(id: string): Project | undefined;

  add(project: Project): void;

  save(): Promise<void>;

  load(): Promise<void>;
}

export class ProjectRegistry implements IProjectRegistry {
  private projects: Map<string, Project> = new Map<string, Project>();
  // readonly dataDirectoryChecked: Promise<boolean>;
  public isLoaded = false;

  async initialize(): Promise<void> {
    if (this.isLoaded) {
      return
    }
    await checkDataDirectory();
    await this.load();
    this.isLoaded = true;
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

  async save(): Promise<void> {
    if (this.isLoaded) {
      await saveProjects(this.projects.values(), config.dataDir);
      for (const project of this.projects.values()) {
        for (const branch of project.branches) {
          await saveBranchHistory(branch, config.dataDir);
        }
      }
    } else {
      throw new VersionRegisterError(
        "ProjectRegistry.save() method cant be called before ProjectRegistry.initialize()"
      );
    }
  }

  async load(): Promise<void> {
    const projects = await loadProjects(config.dataDir);
    for (const project of projects) {
      this.projects.set(project.id, project);
    }
  }
}