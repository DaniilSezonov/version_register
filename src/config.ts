import * as dotenv from "dotenv";
import {defaultConfig} from "./constants";
import "dotenv";


type EmptyConfig = Record<string, string>;

interface Config extends EmptyConfig {
  dataDir: string;
  pattern: string;
  gitlabApiURI: string; // http://gitlab.com/api/v4/;
  gitlabSecret: string;
}

const config: Config | EmptyConfig = {};
let wasLoaded = false;
initializeConfiguration();

export function initializeConfiguration() {
  if (wasLoaded) {
    return
  }
  const envFilePath = process.env.NODE_ENV === "test" ? "test.env" : ".env";
  const envLoader = dotenv.config({path: envFilePath});
  if (envLoader.parsed) {
    config.dataDir = envLoader.parsed["dataDir"] || config.dataDir;
    config.pattern = envLoader.parsed["pattern"] || config.pattern;
    config.gitlabApiURI = envLoader.parsed["gitlabApiURI"] || config.gitlabApiURI;
    config.gitlabSecret = envLoader.parsed["gitlabSecret"] || config.gitlabSecret;
  } else {
    config.dataDir = defaultConfig.dataDir;
    config.gitlabSecret = defaultConfig.gitlabSecret;
    config.gitlabApiURI = defaultConfig.gitlabApiURI;
    config.pattern = defaultConfig.pattern;
    console.log(".env file with configuration is not found. Default configuration was loaded.")
  }
  wasLoaded = true;
}
export default config;