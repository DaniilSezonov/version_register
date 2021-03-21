import { promises as fs } from "fs";
import {VersionRegisterError} from "../errors";
import config from "../config";


export class LoggerError extends VersionRegisterError {
	constructor(error: string) {
		super("Logger error");
		this.setExtraMessage(error);
	}
}

class Logger {
	public logfile = `${config.dataDir}/services.log`
	protected fileHandle?: fs.FileHandle;
	public isReady = false;
	public messagePool: string[] = [];

	async initialize(): Promise<void> {
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
	public async writeLog(msg: string): Promise<void> {
		const formattedMsg = this.formatMsg(msg);
		if (this.isReady && this.fileHandle) {
			await this.fileHandle.write(formattedMsg);
		} else {
			this.messagePool = this.messagePool.concat(formattedMsg);
		}
	}
	protected formatMsg(msg: string): string {
		const date = new Date();
		return `${date.toLocaleTimeString()
		}: ${msg} \n`
	}
	public async bye(): Promise<void> {
		if (this.fileHandle) {
			await this.fileHandle.close();
		}
	}
}

export default Logger;