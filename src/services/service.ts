import axios, { AxiosInstance, AxiosResponse } from "axios";

export type APIResponse<R> = Promise<AxiosResponse<R>>;
export type APIAttrs = any;

export default class RestAPIService {  
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
    // get<R>(): APIResponse<R>;
    // post?<R>(attrs: APIAttrs): APIResponse<R>;
    // abstract put?<R>(attrs: APIAttrs): APIResponse<R>;
    // abstract patch?<R>(attrs: APIAttrs): APIResponse<R>;
    // abstract delete?<R>(attrs: APIAttrs): APIResponse<R>;
}