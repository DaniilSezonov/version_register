import axios, { AxiosInstance, AxiosResponse } from "axios";

export type APIResponse<R> = Promise<AxiosResponse<R>>;
export type APIAttrs = any;

export interface RestAPIService {
    create?<R>(attrs: APIAttrs): APIResponse<R>;
    update?<R>(attrs: APIAttrs): APIResponse<R>;
    read?<R>(attrs: APIAttrs): APIResponse<R>;
    delete?<R>(attrs: APIAttrs): APIResponse<R>;
}

export class RestAPIService {
    protected requester: AxiosInstance;
    protected path?: string;
    constructor(baseUrl: string, apiToken: string) {
        this.requester = axios.create({
            baseURL: baseUrl,
            headers: {
                'CONTENT-TYPE': "application/json",
                'PRIVATE-TOKEN': apiToken,
            }
        })
    }
}