import {ParsedArgs} from "../src";
import {create, update} from "../src/commands";
import config from "../src/config";
import * as fs from "fs";
import {ProjectRegistry} from "../src/registry";
import * as path from "path";
import {HistoryPath, ProjectsStoreFileName} from "../src/constants";
import {ProjectStore} from "../src/store";
import {Branch, BranchHistory, HistoryItem, Project} from "../src/models";


function verify_project_store(dataDir: string, registry: ProjectRegistry) {
  const json = fs.readFileSync(path.join(dataDir, ProjectsStoreFileName), "utf8")
  const data: ProjectStore = JSON.parse(json);
  for (const [project_id, project] of Object.entries(data)) {
    const fromRegistry = registry.getById(project_id);
    if (fromRegistry) {
      expect(fromRegistry.name).toEqual(project.name);
      expect(fromRegistry.id).toEqual(project_id);
      expect(project.branches.length).toBe(fromRegistry.branches.length);
      for (const branch of project.branches) {
        for (const branchData of fromRegistry.branches) {
          if (branchData.id == branch.id) {
            expect(branchData.name).toEqual(branch.name);
            expect(branchData.version.date).toEqual(branchData.version.date);
            expect(
              [
                branchData.version.major,
                branchData.version.minor,
                branchData.version.path
              ],
            ).toEqual(branch.version.value);
          }
        }
      }
    } else {
      expect(true).toBe(false);
    }
  }
}

function verify_branch_history(dataDir: string, branch: Branch) {
  const json = fs.readFileSync(path.join(dataDir, HistoryPath, branch.id), "utf8");
  const data: BranchHistory = JSON.parse(json);
  let historyItem: HistoryItem;
  let prevVersion: [number, number, number] | undefined;
  try {
    do {
      historyItem = data[branch.version.major][branch.version.minor][branch.version.path];
      expect(historyItem.target.value).toMatchObject(
        [branch.version.major, branch.version.minor, branch.version.path]
      );
      prevVersion = historyItem.previous;
      if (prevVersion) {
        historyItem = data[prevVersion[0]][prevVersion[1]][prevVersion[2]];
      }
    } while (prevVersion)
  } catch (e) {
    expect(true).toBe(false);
  }
}

describe("Create Application", () => {
  config.dataDir = "app.test_DataDir";
  afterEach(() => {
    fs.rmdirSync(path.join(config.dataDir), {recursive: true});
  });
  test('Create new application', () => {
    const commandParams: ParsedArgs = {
      projectName: "Test Project",
      branchName: "master",
      startWithVersion: "1.0.0",
      commandType: "create",
    };
    const currentRegistry = create(commandParams);
    verify_project_store(config.dataDir, currentRegistry);
    for (const item of currentRegistry.all()) {
      for (const branch of item.branches) {
        verify_branch_history(config.dataDir, branch);
      }
    }
  });
  test("Create branch for application", () => {
    const project = new Project({
      name: "test",
      branches: [{
        name: "master",
        version: {
          value: [1,0,0],
          date: new Date().toJSON(),
        },
      }]
    });
    let registry = new ProjectRegistry();
    registry.add(project);
    registry.save();
    const commandParams: ParsedArgs = {
      projectId: project.id,
      branchName: "testBranch",
      fromBranch: project.branches[0].name,
      commandType: "create"
    }
    registry = create(commandParams);
    /// todo глупо но работает, а вообще синхронный код оказался не синхронным
    setTimeout(() => {
      verify_project_store(config.dataDir, registry);
      for (const item of registry.all()) {
        for (const branch of item.branches) {
          verify_branch_history(config.dataDir, branch);
        }
      }
    }, 1000)
  });
  test("Update", () => {
    const branchName = "master";
    const testCommitMessage = "Super feature\n" +
      " All tasks has been completed.\n" +
      "--UpdateType=MAJOR";
    const project = new Project({
      name: "test",
      branches: [{
        name: branchName,
        version: {
          value: [1,0,0],
          date: new Date().toJSON(),
        },
      }]
    });
    let registry = new ProjectRegistry();
    registry.add(project);
    registry.save();
    const commandParams: ParsedArgs = {
      projectId: project.id,
      branchName: branchName,
      commandType: "update",
      commitMsg: testCommitMessage,
    }
    registry = update(commandParams);
    /// todo again
    setTimeout(() => {
      verify_project_store(config.dataDir, registry);
      for (const item of registry.all()) {
        for (const branch of item.branches) {
          verify_branch_history(config.dataDir, branch);
        }
      }
      const fromRegistry = registry.getById(project.id);
      if (fromRegistry) {
        const masterBranch = fromRegistry.branches[0];
        masterBranch.version.major = 2;
        masterBranch.version.minor = 0;
        masterBranch.version.path = 0;
      } else {
        expect(true).toBe(false);
      }
    }, 1000)
  });
});