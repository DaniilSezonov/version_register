import {ParsedArgs} from "./index";

export class VersionRegisterError extends Error {
	timestamp: number;
	constructor(message: string) {
		const prefix = "Application error: "
		super(prefix + message);
		this.timestamp = Date.now();
	}
	protected setExtraMessage(extraMsg: string) {
		this.message = `${this.message}\n${extraMsg}`;
	}
}

export class CommandParsingError extends VersionRegisterError {
	constructor(
		message: string,
		commandValue?: string,
		availableValues?: string[]
	) {
		super(message);
		if (commandValue) {
			this.setExtraMessage(
				`The unavailable command '${commandValue}' was specified \n`
			)
			if (availableValues) {
				this.setExtraMessage(`Available commands is: ${availableValues.toString()}`);
			}
		}
	}
}

export class CommandArgumentsError extends VersionRegisterError {
	constructor(message: string, arg?: ParsedArgs) {
		super(message);
		if (arg) {
			this.setExtraMessage(
				`The unavailable argument is ${arg}`
			)
		}
	}
}

export class ModelError extends VersionRegisterError {
	constructor(message: string, modelName?: string) {
		super(message);
		if (modelName) {
			this.setExtraMessage(
				`Error inside model ${modelName}. Command result cant be saved.`
			);
		}
	}
}

export class StoreError extends VersionRegisterError {
	constructor(message: string) {
		super(message);
	}
}