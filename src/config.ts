import * as dotenv from "dotenv";
import {defaultConfig} from "./constants";

interface Config {
  dataDir: string;
  pattern: string;
  gitlabApiURI: string; // http://gitlab.com/api/v4/;
  gitlabSecret: string;
  gitlabProjectId: string;
}

function checkGitlabConfigutraion(config: Config) {
  if (config.gitlabProjectId === "") {
    console.log("\x1b[33m", "gitlabSecret and/or option recived, but gitlabProjectId is not set. Tagging has not working.");
  } else if (config.gitlabSecret === "") {
    console.log("\x1b[33m", "gitlabProjectId and/or option recived, but gitlabSecret is not set. Tagging has not working.");
  }
}
const config: Config = defaultConfig;
try {
  const envLoader = dotenv.config();
  config.dataDir = envLoader.parsed && envLoader.parsed["dataDir"] || defaultConfig.dataDir;
  config.pattern = envLoader.parsed && envLoader.parsed["pattern"] || defaultConfig.pattern;
  config.gitlabApiURI = envLoader.parsed && envLoader.parsed["gitlabApiURI"] || defaultConfig.gitlabApiURI;
  config.gitlabSecret = envLoader.parsed && envLoader.parsed["gitlabSecret"] || defaultConfig.gitlabSecret;
  config.gitlabProjectId = envLoader.parsed && envLoader.parsed["gitlabProjectId"] || defaultConfig.gitlabProjectId;
  checkGitlabConfigutraion(config);
} catch (e) {
  console.log(e);
}
export default config;