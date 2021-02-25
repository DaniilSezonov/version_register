import {findUpdateTypePart} from "./messageParser";
import {Branch, Project, UpdateType, Version} from "./models";
import {ParsedArgs} from "./index";
import {ProjectRegistry} from "./registry";
import config from "./config";
import GitlabTagService from "./services/tagService";
import {defaultConfig, Loggers} from "./constants";
import {VersionRegisterError} from "./errors";


export async function update(commandData: ParsedArgs): Promise<ProjectRegistry> {
  const registry = new ProjectRegistry();
  await registry.initialize();
  const updateTypePart = findUpdateTypePart(commandData?.commitMsg || "");
  let updateType: UpdateType;
  const project = registry.getById(commandData.projectId || "");
  if (!project) {
    throw new VersionRegisterError(
      `Project with id ${commandData.projectId} does not exist.`
    );
  }
  if (commandData.branchName) {
    const branch = project.getBranch(commandData.branchName || "");
    switch (updateTypePart) {
      case "MAJOR":
        updateType = UpdateType.Major;
        break;
      case "MINOR":
        updateType = UpdateType.Minor;
        break;
      case "PATCH":
        updateType = UpdateType.Path;
        break;
      default:
        throw new VersionRegisterError(`
          Update pattern not found in commit message, current pattern is ${config.pattern}
        `);
    }
    if (branch) {
      const newVersion = project.update(updateType, branch.id);
      console.log(newVersion.toString());
    } else {
      throw new VersionRegisterError("Branch does not exists");
    }
    if (isActiveTagging()) {
      await sendTag(project, branch);
    }
  } else if (commandData.gitlabId) {
    project.gitlabProjectId = commandData.gitlabId;
  }
  await registry.save();
  return registry;
}

export async function create<T extends Project | Branch>(commandData: ParsedArgs): Promise<[ProjectRegistry, T]> {
  const registry = new ProjectRegistry();
  await registry.initialize();
  let newItem: Branch | Project;
  if (commandData.projectName && commandData.branchName && commandData.startWithVersion) {
    const newProject = new Project({
      name: commandData.projectName,
      branches: [{
        name: commandData.branchName,
        version: {
          value: parseVersionParam(commandData.startWithVersion),
          date: new Date().toJSON(),
        }
      }],
      gitlabProjectId: commandData.gitlabId,
    });
    registry.add(newProject);
    await registry.save();
    const newBranch = newProject.getBranch(commandData.branchName)
    if (isActiveTagging() && newBranch) {
      await sendTag(
        newProject,
        newBranch
      )
    }
    newItem = newProject;
  } else if (commandData.projectId && commandData.branchName && commandData.fromBranch) {
    const project = registry.getById(commandData.projectId);
    if (!project) {
      throw new VersionRegisterError(`Not found project with id ${commandData.projectId}`);
    } else {
      const newBranch = project.newBranch(commandData.branchName, commandData.fromBranch);
      await registry.save();
      if (isActiveTagging()) {
        await sendTag(project, newBranch);
      }
      newItem = newBranch;
    }
  } else {
    throw new VersionRegisterError(`
      Wrong arguments for command create.
    `);
  }
  return [registry, newItem] as [ProjectRegistry, T];
}

type ReadReturnType = Promise<Version | Project[]>
export async function read(commandData: ParsedArgs): ReadReturnType {
  const registry = new ProjectRegistry();
  await registry.initialize();
  if (commandData.projectId && commandData.branchName) {
    const project = registry.getById(commandData.projectId);
    if (!project) {
      throw new VersionRegisterError(`Not found project with id ${commandData.projectId}`);
    }
    const branch = project?.getBranch(commandData.branchName);
    if (branch) {
      return branch.version;
    } else {
      throw new VersionRegisterError(`Not found branch with name ${commandData.branchName}`);
    }
  }
  return registry.all()
}

function parseVersionParam(version: string) {
  return version.split(".").map(el => Number(el)) as [number, number, number];
}

function isActiveTagging() {
  return !!config.gitlabSecret;
}

async function sendTag(project: Project, branch: Branch) {
  if (!project.gitlabProjectId) {
    throw new VersionRegisterError(
      `gitlabSecret was found but gitlabProjectId is
       not set for project ${project.name}`
    );
  }
  const tagService = new GitlabTagService(config.gitlabApiURI, config.gitlabSecret);
  if (Loggers.serviceLogger) {
    if (!Loggers.serviceLogger.isReady) {
      await Loggers.serviceLogger.initialize();
    }
    await tagService.setLogger(Loggers.serviceLogger);
  }
  await tagService.create({
    id: project.gitlabProjectId,
    tag_name: branch.version.toString(),
    ref: branch.name,
  })
}