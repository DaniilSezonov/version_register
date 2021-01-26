import * as dotenv from "dotenv";
import {defaultConfig} from "./constants";
import "dotenv";

interface Config {
  dataDir: string;
  pattern: string;
  gitlabApiURI: string; // http://gitlab.com/api/v4/;
  gitlabSecret: string;
}

const config: Config = {
  ...defaultConfig
};
try {
  const envLoader = dotenv.config();
  if (envLoader.parsed) {
    config.dataDir = envLoader.parsed["dataDir"] || defaultConfig.dataDir;
    config.pattern = envLoader.parsed["pattern"] || defaultConfig.pattern;
    config.gitlabApiURI = envLoader.parsed["gitlabApiURI"] || defaultConfig.gitlabApiURI;
    config.gitlabSecret = envLoader.parsed["gitlabSecret"] || defaultConfig.gitlabSecret;
  }
} catch (e) {
  console.log(e);
}
export default config;