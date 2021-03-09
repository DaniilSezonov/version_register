// import {ParsedArgs} from "../src";
// import {create, update} from "../src/commands";
// import config from "../src/config";
// import {promises as fs } from "fs";
// import {ProjectRegistry} from "../src/registry";
// import * as path from "path";
// import {HistoryPath, ProjectsStoreFileName} from "../src/constants";
// import {ProjectStore} from "../src/store";
// import {Branch, BranchHistory, HistoryItem, Project} from "../src/models";
//
//
// async function verify_project_store(dataDir: string, registry: ProjectRegistry) {
//   const json = await fs.readFile(path.join(dataDir, ProjectsStoreFileName));
//   const data: ProjectStore = JSON.parse(json.toString());
//   for (const [project_id, project] of Object.entries(data)) {
//     const fromRegistry = registry.getById(project_id);
//     if (fromRegistry) {
//       expect(fromRegistry.name).toEqual(project.name);
//       expect(fromRegistry.id).toEqual(project_id);
//       expect(project.branches.length).toBe(fromRegistry.branches.length);
//       for (const branch of project.branches) {
//         for (const branchData of fromRegistry.branches) {
//           if (branchData.id == branch.id) {
//             expect(branchData.name).toEqual(branch.name);
//             expect(branchData.version.date).toEqual(branchData.version.date);
//             expect(
//               [
//                 branchData.version.major,
//                 branchData.version.minor,
//                 branchData.version.path
//               ],
//             ).toEqual(branch.version.value);
//           }
//         }
//       }
//     } else {
//       expect(true).toBe(false);
//     }
//   }
// }
//
// async function verify_branch_history(dataDir: string, currentRegistry: ProjectRegistry, branch: Branch) {
//   const json = await fs.readFile(path.join(dataDir, HistoryPath, branch.id));
//   const data: BranchHistory = JSON.parse(json.toString());
//   let historyItem: HistoryItem = data[branch.version.major][branch.version.minor][branch.version.path];
//   let prevVersion: [number, number, number] | undefined;
//   do {
//     expect(historyItem.target.value).toMatchObject(
//       [branch.version.major, branch.version.minor, branch.version.path]
//     );
//     prevVersion = historyItem.previous;
//     if (prevVersion) {
//       historyItem = data[prevVersion[0]][prevVersion[1]][prevVersion[2]];
//     }
//   } while (prevVersion !== undefined)
// }
// describe("Create Application",   () => {
// /*  afterEach(async () => {
//     await fs.rmdir(path.join(config.dataDir), {recursive: true});
//   });*/
//   test('Create new application', async () => {
//     const commandParams: ParsedArgs = {
//       projectName: "Test Project",
//       branchName: "master",
//       startWithVersion: "1.0.0",
//       commandType: "create",
//     };
//     const [currentRegistry,] = await create(commandParams);
//     await verify_project_store(config.dataDir, currentRegistry);
//     for (const item of currentRegistry.all()) {
//       for (const branch of item.branches) {
//         await verify_branch_history(config.dataDir, currentRegistry, branch);
//       }
//     }
//   });
//   test("Create branch for application", async () => {
//     const project = new Project({
//       name: "test",
//       branches: [{
//         name: "master",
//         version: {
//           value: [1,0,0],
//           date: new Date().toJSON(),
//         },
//       }]
//     });
//     let registry = new ProjectRegistry();
//     await registry.initialize();
//     registry.add(project);
//     await registry.save();
//     const branchName = "testBranch";
//     const branchPreReleaseTag = "dev";
//     const commandParams: ParsedArgs = {
//       projectId: project.id,
//       branchName: branchName,
//       fromBranch: project.branches[0].name,
//       commandType: "create",
//       preRelease: branchPreReleaseTag
//     };
//     [registry,] = await create<Branch>(commandParams);
//     await verify_project_store(config.dataDir, registry);
//     for (const item of registry.all()) {
//       for (const branch of item.branches) {
//         await verify_branch_history(config.dataDir, branch);
//       }
//     }
//     const projectFromRegistry = registry.getById(project.id);
//     const branchFromRegistry = projectFromRegistry?.getBranch(branchName);
//     expect(branchFromRegistry?.preReleaseTag).toEqual(branchPreReleaseTag);
//
//   });
//   test("Update", async () => {
//     const branchName = "master";
//     const testCommitMessage = "Super feature\n" +
//       " All tasks has been completed.\n" +
//       "--UpdateType=MAJOR";
//     const project = new Project({
//       name: "test",
//       branches: [{
//         name: branchName,
//         version: {
//           value: [1,0,0],
//           date: new Date().toJSON(),
//         },
//       }]
//     });
//     let registry = new ProjectRegistry();
//     await registry.initialize();
//     registry.add(project);
//     await registry.save();
//     const commandParams: ParsedArgs = {
//       projectId: project.id,
//       branchName: branchName,
//       commandType: "update",
//       commitMsg: testCommitMessage,
//     };
//     registry = await update(commandParams);
//     await verify_project_store(config.dataDir, registry);
//     for (const item of registry.all()) {
//       for (const branch of item.branches) {
//         await verify_branch_history(config.dataDir, branch);
//       }
//     }
//     const fromRegistry = registry.getById(project.id);
//     if (fromRegistry) {
//       const masterBranch = fromRegistry.branches[0];
//       masterBranch.version.major = 2;
//       masterBranch.version.minor = 0;
//       masterBranch.version.path = 0;
//     } else {
//       expect(true).toBe(false);
//     }
//   });
// });