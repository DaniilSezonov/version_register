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
  name: string;
  branches: BranchData[];
}

export interface BranchData {
  id?: string;
  name: string;
  version: VersionData;
}

export interface VersionData {
  value: [number, number, number];
  date: string;
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

  constructor(data: ProjectData) {
    this.id = data.id ? data.id : createUUID();
    this.name = data.name;
    data.branches.map(branch => {
      this.branches = this.branches.concat(new Branch({
        id: branch.id,
        name: branch.name,
        version: branch.version,
      }))
    })
  }

  newBranch(name: string, from: string): void {
    const fromBranch = this.branches.find(branch => branch.name === from);
    if (!fromBranch) {
      throw new Error(`Branch with branch ${from} does not exist in project ${this.name}`);
    }
    this.createBranch({
      name: name,
      version: {
        value: [fromBranch.version.major, fromBranch.version.minor, fromBranch.version.path],
        date: fromBranch.version.date.toJSON(),
      },
    })
  }

  getBranch(name: string): Branch | undefined {
    return this.branches.find(el => el.name === name);
  }

  update(type: UpdateType, branchId: string): void {
    const branch = this.branches.find((el) => el.id == branchId);
    if (!branch) {
      throw Error("Project update failure. Wrong branchId value.")
    }
    branch.update(type);
  }

  private createBranch(data: BranchData): void {
    const newBranch = new Branch({
      name: data.name,
      version: data.version,
    });
    this.addBranch(newBranch);
  }

  addBranch(branch: Branch): void {
    this.branches = this.branches.concat(branch);
  }
}

export class Branch {
  id: string;
  name: string;
  version: Version;
  previousVersion: [number, number, number] | null;

  constructor(data: BranchData) {
    this.name = data.name;
    this.version = new Version(data.version);
    this.previousVersion = null;
    if (data.id) {
      this.id = data.id;
    } else {
      this.id = createUUID();
    }
  }

  static fromBranch(branch: Branch, name: string): Branch {
    return new Branch({
      name: name,
      version: {
        value: [branch.version.major, branch.version.minor, branch.version.path],
        date: branch.version.date.toJSON(),
      }
    });
  }

  update(type: UpdateType): void {
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
        throw new Error("Wrong update type");
    }
    this.previousVersion = [this.version.major, this.version.minor, this.version.path];
    this.version = new Version({
      value: nextVersion,
      date: new Date().toJSON()
    });
  }
}

export class Version {
  major: number;
  minor: number;
  path: number;
  date: Date;

  constructor(data: VersionData) {
    [this.major, this.minor, this.path] = data.value;
    this.date = new Date(data.date);
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