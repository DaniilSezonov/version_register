import {Branch, BranchHistory, HistoryItem, Project, ProjectData} from "./models";
import {promises as fs} from "fs";
import config from "./config";
import * as path from "path";
import {DataDirectoryPermission, HistoryPath, ProjectsStoreFileName} from "./constants";
import {StoreError} from "./errors";


export interface ProjectStore {
  [id: string]: ProjectData,
}

export async function checkDataDirectory(): Promise<void> {
  try {
    await fs.readdir(config.dataDir);
  } catch (error) {
    console.log("Data directory does not exists. Creating data...")
    await fs.mkdir(config.dataDir, DataDirectoryPermission);
    console.log(`
            Data directory created successful./n 
            Name: ${config.dataDir} /n
            Permission: ${DataDirectoryPermission}
        `);
  }
  try {
    await fs.readdir(path.join(config.dataDir, HistoryPath));
  } catch (error) {
    console.log("History directory does not exists. Creating history...")
    await fs.mkdir(path.join(config.dataDir, HistoryPath), DataDirectoryPermission);
    console.log(`
            History directory created successful./n 
            Name: ${path.join(config.dataDir, HistoryPath)} /n
            Permission: ${DataDirectoryPermission}
        `);
  }
}

export async function saveProjects(projects: IterableIterator<Project>, dataDir: string): Promise<void> {
  const out: Partial<ProjectStore> = {};
  for (const project of projects) {
    out[project.id] = {
      name: project.name,
      gitlabProjectId: project.gitlabProjectId,
      branches: project.branches.map(branch => {
        return {
          id: branch.id,
          name: branch.name,
          version: {
            value: [branch.version.major, branch.version.minor, branch.version.path],
            date: branch.version.date.toJSON()
          }
        }
      })
    }
  }
  const json = JSON.stringify(out || {}, null, 4);
  await fs.writeFile(path.join(dataDir, ProjectsStoreFileName), json);
}

export async function loadProjects(dataDir: string): Promise<Project[]> {
  let result: any[] = [];
  let json: ProjectStore = {};
  try {
    const content = await fs.readFile(path.resolve(dataDir, ProjectsStoreFileName), "utf8");
    json = JSON.parse(content);
  } catch (error) {
    console.log(`${ProjectsStoreFileName} does not exists. It has been created.`)
    await fs.writeFile(path.resolve(dataDir, ProjectsStoreFileName), JSON.stringify({}));
  }
  for (const [id, projectData] of Object.entries(json)) {
    result = result.concat(new Project({
      id,
      name: projectData.name,
      branches: projectData.branches,
      gitlabProjectId: projectData.gitlabProjectId
    }))
  }
  return result;
}

export async function saveBranchHistory(branch: Branch, dataDir: string): Promise<void> {
  const historyDir = await fs.readdir(path.join(dataDir, HistoryPath));
  let prevHistoryFile = null;
  for (const historyFileName of historyDir) {
    if (prevHistoryFile && historyFileName === branch.id) {
      console.log("\x1b[31m", `Multiple history file with same names ${historyFileName}`);
      throw new StoreError(`Multiple history file with same names`);
    }
    prevHistoryFile = historyFileName === branch.id ? historyFileName : prevHistoryFile ||  null;
  }
  let history: BranchHistory = {};
  let latestHistory: HistoryItem | undefined = undefined;
  if (prevHistoryFile && branch.previousVersion) {
    const data = await fs.readFile(path.join(dataDir, HistoryPath, prevHistoryFile as string), "utf8");
    history = JSON.parse(data);
    try {
      /// todo questionable decision
      latestHistory = history[branch.previousVersion[0]][branch.previousVersion[1]][branch.previousVersion[2]];
    } catch (error) {
      console.log("\x1b[31m", "Corrupted datafile! Several of the versions are missing.")
      throw new StoreError("Save history error");
    }
  }
  /// Creating new directory
  const newItem: BranchHistory = {
    [branch.version.major]: {
      [branch.version.minor]: {
        [branch.version.path]: {
          target: {
            value: [branch.version.major, branch.version.minor, branch.version.path],
            date: branch.version.date.toJSON(),
          },
          previous: latestHistory?.previous
        }
      }
    }
  }

  const newHistory = mergeHistory(
    history,
    newItem,
    [branch.version.major, branch.version.minor, branch.version.path]
  )
  await fs.writeFile(path.join(dataDir, HistoryPath, branch.id), JSON.stringify(newHistory), "utf8");
}

function mergeHistory(history: BranchHistory, newHistoryItem: BranchHistory, newVersion: [number, number, number]) {
  let result: BranchHistory;
  if (!history[newVersion[0]]) {
    result = {
      ...history,
      ...newHistoryItem,
    }
  } else if (!history[newVersion[0]][newVersion[1]]) {
    result = {
      ...history,
      [newVersion[0]]: {
        ...history[newVersion[0]],
        ...newHistoryItem[newVersion[0]]
      }
    }
  } else if (!history[newVersion[0]][newVersion[1]][newVersion[2]]) {
    result = {
      ...history,
    }
    result[newVersion[0]][newVersion[1]][newVersion[2]] = newHistoryItem[newVersion[0]][newVersion[1]][newVersion[2]]
  } else {
    console.log("\x1b[31m", "Something was really wrong!")
    throw new StoreError("New version already exist?")
  }
  return result;
}