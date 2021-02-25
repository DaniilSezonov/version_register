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
const envFilePath = process.env.NODE_ENV === "test" ? "test.env" : ".env";
const envLoader = dotenv.config({path: envFilePath});
if (envLoader.parsed) {
  config.dataDir = envLoader.parsed["dataDir"] || config.dataDir;
  config.pattern = envLoader.parsed["pattern"] || config.pattern;
  config.gitlabApiURI = envLoader.parsed["gitlabApiURI"] || config.gitlabApiURI;
  config.gitlabSecret = envLoader.parsed["gitlabSecret"] || config.gitlabSecret;
}
export default config;