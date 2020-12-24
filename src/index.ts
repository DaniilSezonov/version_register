import {create, update} from "./commands";
import {Branch, Project} from "./models";

const CreateTypeArg = "create";
const UpdateTypeArg = "update";
type CommandTypes = typeof CreateTypeArg | typeof UpdateTypeArg;

const CommitMsgParam = "--commit-msg";
// const CommitShaParam = "--commit-sha";
const ProjectNameParam = "--project-name";
const ProjectIdParam = "--project-id";
const BranchNameParam = "--branch-name";
const StartWithParam = "--init-version"
const FromBranchPram = "--from";

type AvailableParams =
  typeof CommitMsgParam |
  // typeof CommitShaParam |
  typeof ProjectIdParam |
  typeof BranchNameParam |
  typeof ProjectNameParam |
  typeof FromBranchPram |
  typeof StartWithParam;

const CreateAvailableParams: AvailableParams[] = [
  ProjectNameParam,
  BranchNameParam,
  // CommitShaParam,
  StartWithParam,
  FromBranchPram
];

const UpdateAvailableParams: AvailableParams[] = [
  CommitMsgParam,
  ProjectIdParam,
]

const CommitMsgKey = "commitMsg";
// const CommitShaKey = "commitSha";
const ProjectIdKey = "projectId";
const BranchNameKey = "branchName";
const FromBranchKey = "fromBranch";
const ProjectNameKey = "projectName";
const StartWithKey = "startWithVersion";

type AvailableKeys =
  typeof CommitMsgKey |
  // typeof CommitShaKey |
  typeof ProjectIdKey |
  typeof BranchNameKey |
  typeof ProjectNameKey |
  typeof FromBranchKey |
  typeof StartWithKey;

const ParamToKeyMapping = new Map<AvailableParams, AvailableKeys>(
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
      FromBranchPram,
      FromBranchKey,
    ]
    // [
    //     CommitShaParam,
    //     CommitShaKey
    // ]
  ],
);


export interface ParsedArgs {
  commitMsg?: string;
  branchName?: string;
  projectId?: string;
  projectName?: string;
  startWithVersion?: string;
  fromBranch?: string;
  commandType: CommandTypes;
}

const raiseParsingError = (): ParsedArgs => {
  console.log("Wrong arguments of command. Available and required args is --commit-msg and --commit-sha");
  throw new Error("Wrong arguments of command.")
}
const parseArgs = (argv: string[]) => {
  const parsedArgs: ParsedArgs | Record<string, any> = {};
  const commandArgs = argv.slice(3);
  const commandTypeArg = argv[2] as CommandTypes;
  if (!(commandTypeArg === CreateTypeArg || commandTypeArg === UpdateTypeArg)) {
    raiseParsingError();
  } else {
    parsedArgs["commandType"] = commandTypeArg;
  }
  const FullParams = CreateAvailableParams.concat(UpdateAvailableParams);
  let parsedArg: AvailableParams | undefined;
  for (const arg of commandArgs) {
    if (FullParams.find((value => value == arg))) {
      parsedArg = arg as AvailableParams;
      continue;
    }
    if (parsedArg) {
      const key = ParamToKeyMapping.get(parsedArg);
      if (key) {
        parsedArgs[key] = arg;
      }
      parsedArg = undefined;
    }
  }
  return parsedArgs as ParsedArgs;
}

const commandData = parseArgs(process.argv);

switch (commandData.commandType) {
  case "create": {
    const [registry, createdElement] = create(commandData);
    if (createdElement instanceof Project) {
      console.log(`New project has been created with id: \n${createdElement.id}`)
    }
    if (createdElement instanceof Branch) {
      console.log(`New branch has been created with id: \n${createdElement.id}`)
    }
    break;
  }
  case "update":
    update(commandData);
    break;
  default:
    throw new Error("Please select create or update command option.")
}