import { promises as fs } from "fs";
import {VersionRegisterError} from "../errors";


class LoggerError extends VersionRegisterError {
	constructor(error: string) {
		super("Logger error, can not create logfile");
		this.setExtraMessage(error);
	}
}

class Logger {
	public logfile = "./services.log"
	protected fileHandle?: fs.FileHandle;
	public isReady = false;
	public messagePool: string[] = [];

	async initialize() {
		try {
			this.fileHandle = await fs.open(this.logfile, "a");
			await fs.access(this.logfile);
			this.isReady = true;
			for (const msg of this.messagePool) {
				await this.writeLog(msg);
			}
		} catch(error) {
			throw new LoggerError(error);
		}
	}
	public async writeLog(msg: string) {
		if (this.isReady && this.fileHandle) {
			await this.fileHandle.write(msg);
		} else {
			this.messagePool = this.messagePool.concat(msg);
		}
	}
	public async bye() {
		if (this.fileHandle) {
			await this.fileHandle.close();
		}
	}
}

export default Logger;