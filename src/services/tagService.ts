import config from "../config";
import RestAPIService, { APIAttrs, APIResponse } from "./service";

interface GitlabTagData {
    name: string;
    message?: string;
    target: string;
    commit: {
        id: string,
        short_id: string,
        title: string,
        created_at: string,
        parrent_ids: string[],
        message: string,
        author_name: string,
        author_email: string,
        authored_date: string,
        commiter_name: string,
        commiter_email: string,
        commited_data: string,
    },
    realse?: {
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
    path = `/projects/${config.gitlabProjectId}/repository/tags`;
    async read() {
        return this.requester.get<GitlabTagData>(this.path);
    };
    async create(attrs: GitlabTagAttrs): APIResponse<GitlabTagData> {
        const response = await this.requester.post<GitlabTagData>(this.path, {params: attrs});
        if (response.status == 201) {
            console.log(`Tagging was finished succesfully. Branch: ${response.data.target}`)
        }
        return response;
    };
}