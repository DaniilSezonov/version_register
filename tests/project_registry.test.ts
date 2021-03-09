import {Project, UpdateType} from "../src/models";
import {ProjectRegistry} from "../src/registry";
import config from "../src/config";
import * as fs from "fs";

describe('Project Model', () => {
  test('Update Project', () => {
    const initVersion: [number, number, number] = [1, 0, 0];
    const branchName = "testbranch";
    const newProject = new Project({
      name: "Test",
      branches: [{
        id: branchName,
        name: branchName,
        version: {
          value: initVersion,
          date: new Date().toJSON()
        }
      }],
    });
    let prevVersion = initVersion;
    newProject.update(UpdateType.Path, branchName);
    let branch = newProject.getBranch(branchName);
    if (branch) {
      expect(branch.version.path).toEqual(initVersion[2] + 1);
      expect(branch.previousVersion).toEqual(prevVersion);
      prevVersion = [branch.version.major, branch.version.minor, branch.version.path];
    } else {
      expect(true).toEqual(false);
    }

    newProject.update(UpdateType.Minor, branchName);
    branch = newProject.getBranch(branchName);
    if (branch) {
      expect(branch.version.minor).toEqual(initVersion[1] + 1);
      expect(branch.previousVersion).toEqual(prevVersion);
      prevVersion = [branch.version.major, branch.version.minor, branch.version.path];
    } else {
      expect(true).toEqual(false);
    }

    newProject.update(UpdateType.Major, branchName);
    branch = newProject.getBranch(branchName);
    if (branch) {
      expect(branch.version.major).toEqual(initVersion[0] + 1);
      expect(branch.previousVersion).toEqual(prevVersion);
    } else {
      expect(true).toEqual(false);
    }
  });
  test("Drop lower versions after update", () => {
    const initVersion: [number, number, number] = [1, 0, 0];
    const branchName = "TestBranch";
    const project = new Project({
      name: "TestProject",
      branches: [{
        id: branchName,
        name: branchName,
        version: {
          value: initVersion,
          date: new Date().toJSON()
        }
      }]
    });
    project.update(UpdateType.Path, branchName);
    project.update(UpdateType.Minor, branchName);
    expect(project.getBranch(branchName)?.version.path).toEqual(0);
    project.update(UpdateType.Major, branchName);
    expect(project.getBranch(branchName)?.version.minor).toEqual(0);
  });
});


describe("Registry", () => {
  config.dataDir = "test.dataDir";
  test('Save/Load', async () => {
    const initVersion: [number, number, number] = [1, 0, 0];
    const branchId = "testbranchid";
    const branchName = "test-branch";
    const gitlabProjectId = "GITLAB_PROJECT_ID";
    const preReleaseTag = "release";
    const registry = new ProjectRegistry();
    await registry.initialize();
    const newProject = new Project({
      name: "Test",
      gitlabProjectId: gitlabProjectId,
      branches: [{
        id: branchId,
        name: branchName,
        preReleaseTag: preReleaseTag,
        version: {
          value: initVersion,
          date: new Date().toJSON()
        }
      }],
    });
    registry.add(newProject);
    expect(registry.getById(newProject.id)).toBeInstanceOf(Project);
    await registry.save();
    const newRegistry = new ProjectRegistry();
    await newRegistry.initialize();
    const loadedProject = newRegistry.getById(newProject.id);
    if (!loadedProject) {
      expect(true).toEqual(false);
    } else {
      expect(loadedProject).toBeInstanceOf(Project);
      expect(loadedProject.gitlabProjectId).toEqual(gitlabProjectId);
      expect(loadedProject.getBranch(branchName)?.preReleaseTag).toEqual(preReleaseTag);
      expect(loadedProject.getBranch(branchName)?.name).toEqual(branchName);
    }
  });
  afterAll(() => {
    fs.rmdirSync(config.dataDir, {recursive: true});
  });
});