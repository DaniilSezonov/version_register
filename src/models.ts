import {ModelError} from "./errors";

export interface HistoryItem {
  target: VersionData,
  previous: [number, number, number] | undefined
}

export interface BranchHistory {
  [major: number]: {
    [minor: number]: {
      [path: number]: HistoryItem
    }
  }
}

export interface ProjectData {
  id?: string;
  gitlabProjectId?: string;
  name: string;
  branches: BranchData[];
}

export interface BranchData {
  id?: string;
  name: string;
  version: VersionData;
  previousVersion?: [number, number, number];
  preReleaseTag?: string;
}

export interface VersionData {
  value: [number, number, number];
  date: string;
  preRelease?: string;
}

export enum UpdateType {
  Major = 0,
  Minor = 1,
  Path = 2,
}

export class Project {
  id: string;
  name: string;
  branches: Branch[] = [];
  gitlabProjectId?: string;

  constructor(data: ProjectData) {
    this.id = data.id ? data.id : createUUID();
    this.name = data.name;
    this.gitlabProjectId = data.gitlabProjectId;
    data.branches.map(branch => {
      this.branches = this.branches.concat(new Branch({
        id: branch.id,
        name: branch.name,
        version: branch.version,
        preReleaseTag: branch.preReleaseTag,
      }))
    })
  }

  newBranch(name: string, from: string, preReleaseTagValue?: string): Branch {
    const fromBranch = this.branches.find(branch => branch.name === from);
    if (!fromBranch) {
      throw new ModelError(
        `Branch with branch ${from} does not exist in project ${this.name}`,
        this.constructor.name
      );
    }
    return this.createBranch({
      name: name,
      version: {
        value: [fromBranch.version.major, fromBranch.version.minor, fromBranch.version.path],
        date: fromBranch.version.date.toJSON(),
      },
      preReleaseTag: preReleaseTagValue,
    });
  }

  getBranch(name: string): Branch | undefined {
    return this.branches.find(el => el.name === name);
  }

  update(type: UpdateType, branchId: string): Version {
    const branch = this.branches.find((el) => el.id == branchId);
    if (!branch) {
      throw new ModelError(
        "Project update failure. Wrong branchId value.",
        this.constructor.name
      )
    }
    branch.update(type);
    return branch.version;
  }

  private createBranch(data: BranchData): Branch {
    const newBranch = new Branch({
      name: data.name,
      version: data.version,
      preReleaseTag: data.preReleaseTag,
    });
    this.addBranch(newBranch);
    return newBranch;
  }

  addBranch(branch: Branch): void {
    this.branches = this.branches.concat(branch);
  }
}

export class Branch {
  id: string;
  name: string;
  version: Version;
  previousVersion: [number, number, number] | undefined;
  preReleaseTag?: string;

  constructor(data: BranchData) {
    this.name = data.name;
    this.previousVersion = data.previousVersion;
    this.preReleaseTag = data.preReleaseTag;
    this.version = new Version({...data.version, preRelease: this.preReleaseTag});
    if (data.id) {
      this.id = data.id;
    } else {
      this.id = createUUID();
    }
  }

  static fromBranch(branch: Branch, name: string, preReleaseTag?: string): Branch {
    return new Branch({
      name: name,
      version: {
        value: [branch.version.major, branch.version.minor, branch.version.path],
        date: branch.version.date.toJSON(),
      },
      preReleaseTag: preReleaseTag,
      previousVersion: branch.previousVersion,
    });
  }

  update(type: UpdateType): Version {
    let nextVersion: [number, number, number];
    switch (type) {
      case UpdateType.Major:
        nextVersion = [this.version.major + 1, 0, 0];
        break;
      case UpdateType.Minor:
        nextVersion = [this.version.major, this.version.minor + 1, 0];
        break;
      case UpdateType.Path:
        nextVersion = [this.version.major, this.version.minor, this.version.path + 1];
        break;
      default:
        throw new ModelError("Wrong update type", this.constructor.name);
    }
    this.previousVersion = [this.version.major, this.version.minor, this.version.path];
    this.version = new Version({
      value: nextVersion,
      date: new Date().toJSON(),
      preRelease: this.preReleaseTag,
    });
    return this.version;
  }
}

export class Version {
  major: number;
  minor: number;
  path: number;
  preRelease?: string;
  date: Date;

  constructor(data: VersionData) {
    [this.major, this.minor, this.path] = data.value;
    this.preRelease = data.preRelease;
    this.date = new Date(data.date);
  }
  toString() {
    let preReleaseTagValue = this.preRelease ? `-${this.preRelease}` : "";
    return `${this.major}.${this.minor}.${this.path}${preReleaseTagValue}`;
  }
}

function createUUID() {
  // http://www.ietf.org/rfc/rfc4122.txt
  const s = [];
  const hexDigits = "0123456789abcdef";
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  const uuid = s.join("");
  return uuid;
}