export const ProjectsStoreFileName = "projects.json";
export const HistoryPath = "history";
export const DataDirectoryPermission = "744";
export const defaultConfig = {
  dataDir: "data",
  pattern: "--UpdateType=(MAJOR|MINOR|PATCH)",
  gitlabApiURI: "https://gitlab.com/api/v4/",
  gitlabSecret: "",
  gitlabProjectId: "",
}
export const applicationVersion = `${process.env.npm_package_version}`;