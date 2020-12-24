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
    newProject.update(UpdateType.Path, branchName);
    expect(newProject.getBranch(branchName)?.version.path).toEqual(initVersion[2] + 1)
    newProject.update(UpdateType.Minor, branchName)
    expect(newProject.getBranch(branchName)?.version.minor).toEqual(initVersion[1] + 1)
    newProject.update(UpdateType.Major, branchName);
    expect(newProject.getBranch(branchName)?.version.major).toEqual(initVersion[0] + 1)
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
  test('Save/Load', () => {
    const initVersion: [number, number, number] = [1, 0, 0];
    const branchId = "testbranchid";
    const registry = new ProjectRegistry();
    const newProject = new Project({
      name: "Test",
      branches: [{
        id: branchId,
        name: "testBranch",
        version: {
          value: initVersion,
          date: new Date().toJSON()
        }
      }],
    });
    registry.add(newProject)
    expect(registry.getById(newProject.id)).toBeInstanceOf(Project);
    registry.save()
    const newRegistry = new ProjectRegistry();
    expect(newRegistry.getById(newProject.id)).toBeInstanceOf(Project);
  });
  afterAll(() => {
    fs.rmdirSync(config.dataDir, {recursive: true});
  });
});