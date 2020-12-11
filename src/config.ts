import * as dotenv from "dotenv";
import {defaultConfig} from "./constants";

interface Config {
  dataDir: string;
  pattern: string;
}

const config: Config = defaultConfig;
try {
  const envLoader = dotenv.config();
  config.dataDir = envLoader.parsed && envLoader.parsed["dataDir"] || defaultConfig.dataDir;
  config.pattern = envLoader.parsed && envLoader.parsed["pattern"] || defaultConfig.pattern;
} catch (e) {
  console.log(e);
}
export default config;