import {findUpdateTypePart} from "./messageParser";
import {Project, UpdateType} from "./models";
import {ParsedArgs} from "./index";
import {ProjectRegistry} from "./registry";

function parseVersionParam(version: string) {
  return version.split(".").map(el => Number(el)) as [number, number, number];
}

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
    throw new Error(
      `Project with id ${commandData.projectId} does not exist.`
    );
  }
  const branch = project.getBranch(commandData.branchName || "");
  if (branch) {
    project.update(updateType, branch.id);
  } else {
    throw new Error("Branch does not exists");
  }
  registry.save();
  return registry;
}

export function create(commandData: ParsedArgs): ProjectRegistry {
  const registry = new ProjectRegistry();
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
    return registry
  }
  if (commandData.projectId && commandData.branchName && commandData.fromBranch) {
    const project = registry.getById(commandData.projectId);
    project?.newBranch(commandData.branchName, commandData.fromBranch);
    return registry;
  }
  throw Error("Wrong arguments for command create");
}