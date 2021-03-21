import axios, {AxiosInstance, AxiosResponse} from "axios";
import Logger from "./logger";

export type APIResponse<R> = Promise<AxiosResponse<R>>;
export type APIAttrs = any;

export interface RestAPIService<R> {
	create?(attrs: APIAttrs): APIResponse<R>;
	create?<N>(attrs: APIAttrs): APIResponse<N>;
	update?(attrs: APIAttrs): APIResponse<R>;
	update?<N>(attrs: APIAttrs): APIResponse<N>;
	read?(attrs: APIAttrs): APIResponse<R>;
	read?<N>(attrs: APIAttrs): APIResponse<N>;
	delete?(attrs: APIAttrs): APIResponse<R>;
	delete?<N>(attrs: APIAttrs): APIResponse<N>;
}

export class RestAPIService<R> {
	public logger?: Logger;
	protected requester: AxiosInstance;
	protected path?: string;

	constructor(baseUrl: string, apiToken: string) {
		this.requester = axios.create({
			baseURL: baseUrl,
			headers: {
				'CONTENT-TYPE': "application/json",
				'PRIVATE-TOKEN': apiToken,
			}
		});
	}

	async setLogger(logger: Logger) {
    this.logger = logger;
    return await logger.initialize();
	}
}