import {create, update, read} from "./commands";
import {Branch, Project, Version} from "./models";
import {CommandArgumentsError, CommandParsingError, VersionRegisterError} from "./errors";
import {applicationVersion, Loggers} from "./constants";
import Logger from "./services/logger";


const CreateTypeArg = "create";
const UpdateTypeArg = "update";
const ReadTypeArg = "read";

export const availableArgs = [CreateTypeArg, UpdateTypeArg, ReadTypeArg];

export type CommandTypes = typeof CreateTypeArg | typeof UpdateTypeArg | typeof ReadTypeArg;

const CommitMsgParam = "--commit-msg";
// const CommitShaParam = "--commit-sha";
const ProjectNameParam = "--project-name";
const ProjectIdParam = "--project-id";
const BranchNameParam = "--branch-name";
const StartWithParam = "--init-version"
const FromBranchParam = "--from";
const GitlabProjectIdParam = "--gitlab-id";

type AvailableParams =
  typeof CommitMsgParam |
  // typeof CommitShaParam |
  typeof ProjectIdParam |
  typeof BranchNameParam |
  typeof ProjectNameParam |
  typeof FromBranchParam |
  typeof StartWithParam |
  typeof GitlabProjectIdParam;

const CREATE_AVAILABLE_PARAMS: AvailableParams[] = [
  ProjectNameParam,
  BranchNameParam,
  // CommitShaParam,
  StartWithParam,
  FromBranchParam,
  GitlabProjectIdParam
];

export const UPDATE_AVAILABLE_PARAMS: AvailableParams[] = [
  CommitMsgParam,
  ProjectIdParam,
  GitlabProjectIdParam
]

const CommitMsgKey = "commitMsg";
// const CommitShaKey = "commitSha";
const ProjectIdKey = "projectId";
const BranchNameKey = "branchName";
const FromBranchKey = "fromBranch";
const ProjectNameKey = "projectName";
const StartWithKey = "startWithVersion";
const GitlabProjectIdKey = "gitlabId";

export interface ParsedArgs {
  commitMsg?: string;
  branchName?: string;
  projectId?: string;
  projectName?: string;
  startWithVersion?: string;
  fromBranch?: string;
  commandType: CommandTypes;
  gitlabId?: string;
}

type AvailableKeys =
  typeof CommitMsgKey |
  // typeof CommitShaKey |
  typeof ProjectIdKey |
  typeof BranchNameKey |
  typeof ProjectNameKey |
  typeof FromBranchKey |
  typeof StartWithKey |
  typeof GitlabProjectIdKey;

const PARAM_TO_KEY_MAPPING = new Map<AvailableParams, AvailableKeys>(
  [
    [
      CommitMsgParam,
      CommitMsgKey
    ],
    [
      ProjectIdParam,
      ProjectIdKey,
    ],
    [
      BranchNameParam,
      BranchNameKey,
    ],
    [
      ProjectNameParam,
      ProjectNameKey,
    ],
    [
      StartWithParam,
      StartWithKey
    ],
    [
      FromBranchParam,
      FromBranchKey,
    ],
    [
      GitlabProjectIdParam,
      GitlabProjectIdKey,
    ]
    // [
    //     CommitShaParam,
    //     CommitShaKey
    // ]
  ],
);

const welcome = () => {
  const msg = `Welcome to version-register v${applicationVersion}. Available arguments is:`;
  console.log(msg, availableArgs.map(el => `${el}`));
}

const parseArgs = (args: string[]) => {
  const parsedArgs: ParsedArgs | Record<string, any> = {};
  const commandParams = args.slice(3);
  const commandTypeArg = args[2];
  if (!commandTypeArg) {
    welcome();
    return;
  }
  if (availableArgs.findIndex(command => command === commandTypeArg) === -1) {
    throw new CommandParsingError(
      "ParseCommandError",
      commandTypeArg,
      availableArgs
    );
  } else {
    parsedArgs["commandType"] = <CommandTypes>commandTypeArg;
  }
  const availableParams = [...CREATE_AVAILABLE_PARAMS, ...UPDATE_AVAILABLE_PARAMS];
  let parsedArg: AvailableParams | undefined;
  for (const param of commandParams) {
    if (availableParams.find((value => value === param))) {
      parsedArg = param as AvailableParams;
    } else {
      if (parsedArg) {
        const key = PARAM_TO_KEY_MAPPING.get(parsedArg);
        if (key) {
          parsedArgs[key] = param;
        }
        parsedArg = undefined;
      } else {
        throw new CommandArgumentsError(
          "Wrong command input"
        )
      }
    }
  }
  return parsedArgs as ParsedArgs;
}

function main() {
  const commandData = parseArgs(process.argv);
  if (!commandData) {
    return;
  }
  switch (commandData.commandType) {
    case "create": {
      create(commandData).then(
        ([,createdElement]) => {
          if (createdElement instanceof Project) {
            console.log(`New project has been created with id: \n${createdElement.id}`)
          }
          if (createdElement instanceof Branch) {
            console.log(`New branch has been created with id: \n${createdElement.id}`)
          }
          cleanUp();
        });
      break;
    }
    case "update":
      update(commandData).then(() => {
        cleanUp();
      });
      break;
    case "read": {
      read(commandData).then((result) => {
        if (Array.isArray(result)) {
          console.log(JSON.stringify(result, undefined, " "));
        } else if (result instanceof Version) {
          console.log(result.toString())
        }
        cleanUp();
      });
      break;
    }
  }
}
const serviceLogger = new Logger();
Loggers.serviceLogger = serviceLogger;

try {
  main();
} catch (error) {
  if (error instanceof VersionRegisterError) {
    console.log("\x1b[33m", error.message);
  } else {
    throw new Error(
      "Unhandled error! Something was really wrong. My creator's brains are banana cake."
    )
  }
}

function cleanUp() {
  for (const logger of Object.values(Loggers)) {
    if (logger) {
      logger.bye();
    }
  }
}