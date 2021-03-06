import {APIAttrs, RestAPIService} from "./service";
import {ServiceError} from "../errors";
import {LoggerError} from "./logger";
import {AxiosError} from "axios";

export interface GitlabTagData {
	name: string;
	message?: string;
	target: string;
	commit: {
		id: string,
		short_id: string,
		title: string,
		created_at: string,
		parent_ids: string[],
		message: string,
		author_name: string,
		author_email: string,
		authored_date: string,
		commiter_name: string,
		commiter_email: string,
		commited_data: string,
	},
	release?: {
		tag_name: string,
		description: string,
	}
	protected?: boolean,
}

interface GitlabTagAttrs extends APIAttrs {
	id: string, // The ID or URL-encoded path of the project owned by the authenticated user
	tag_name: string,
	ref: string, //Create tag using commit SHA, another tag name, or branch name
	message?: string, //Creates annotated tag
	release_description?: string, //Add release notes to the Git tag and store it in the GitLab database
}

export default class GitlabTagService extends RestAPIService {
	async create<GitlabTagData>(attrs: GitlabTagAttrs) {
		const path = this.getPath(attrs.id);
		let response;
		try {
			response = await this.requester.post<GitlabTagData>(path, null, {params: attrs});
		} catch (error) {
			const axiosError = <AxiosError<GitlabTagData>>error;
			throw new ServiceError(axiosError.message, "Gitlab tag service");
		}
		if (this.logger) {
			try {
				await this.logger.writeLog(
					`${response.status}: ${response.statusText}`
				);
			} catch (error) {
				throw new LoggerError(error);
			}
		}
		return response;
	}

	getPath(projectId: string): string {
		return `/projects/${projectId}/repository/tags`;
	}
}