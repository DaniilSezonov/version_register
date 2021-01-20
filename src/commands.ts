import {findUpdateTypePart} from "./messageParser";
import {Branch, Project, UpdateType, Version} from "./models";
import {ParsedArgs} from "./index";
import {ProjectRegistry} from "./registry";
import config from "./config";
import GitlabTagService from "./services/tagService";
import {defaultConfig} from "./constants";


export function update(commandData: ParsedArgs): ProjectRegistry {
  const registry = new ProjectRegistry();
  const updateTypePart = findUpdateTypePart(commandData?.commitMsg || "");
  let updateType: UpdateType;
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
      throw new Error("Cant find update type pattern in commit message.")
  }
  const project = registry.getById(commandData.projectId || "");
  if (!project) {
    console.log(`Project with id ${commandData.projectId} does not exist.`);
    throw new Error(
      "Project with selected id does not exist."
    );
  }
  const branch = project.getBranch(commandData.branchName || "");
  if (branch) {
    project.update(updateType, branch.id);
  } else {
    throw new Error("Branch does not exists");
  }
  registry.save();
  if (isActiveTagging()) {
    sendTag(project, branch);
  }
  return registry;
}

export function create<T extends Project | Branch>(commandData: ParsedArgs): [ProjectRegistry, T] {
  const registry = new ProjectRegistry();
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
      }]
    });
    registry.add(newProject);
    registry.save();
    const newBranch = newProject.getBranch(commandData.branchName)
    if (isActiveTagging() && newBranch) {
      sendTag(
        newProject,
        newBranch
      )
    }
    newItem = newProject;
  } else if (commandData.projectId && commandData.branchName && commandData.fromBranch) {
    const project = registry.getById(commandData.projectId);
    if (!project) {
      console.log(`Not found project with id ${commandData.projectId}`)
      throw new Error("Not found project with selected id");
    } else {
      const newBranch = project.newBranch(commandData.branchName, commandData.fromBranch);
      registry.save();
      if (isActiveTagging()) {
         sendTag(project, newBranch);
      }
      newItem = newBranch;
    }
  } else {
    throw Error("Wrong arguments for command create.");
  }
  return [registry, newItem] as [ProjectRegistry, T];
}

export function read(commandData: ParsedArgs): Version | Project[] | undefined {
  const registry = new ProjectRegistry();
  if (commandData.projectId && commandData.branchName) {
    const project = registry.getById(commandData.projectId);
    const branch = project?.getBranch(commandData.branchName);
    if (branch) {
      return branch.version;
    }
    else return undefined;
  }
  return registry.all()
}

function parseVersionParam(version: string) {
  return version.split(".").map(el => Number(el)) as [number, number, number];
}

function isActiveTagging() {
  return config.gitlabSecret !== defaultConfig.gitlabSecret;
}

function sendTag(project: Project, branch: Branch) {
  if (!project.gitlabProjectId) {
    throw new Error(
      `gitlabSecret was found but gitlabProjectId is
       not set for project ${project.name}`
    );
  }
  const tagService = new GitlabTagService(config.gitlabApiURI, config.gitlabSecret);
  tagService.create({
    id: project.gitlabProjectId,
    tag_name: branch.version.toString(),
    ref: branch.name,
  })
}