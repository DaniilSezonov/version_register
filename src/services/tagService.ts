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
    // async read() {
    //     return this.requester.get<GitlabTagData>(this.path);
    // }
    async create(attrs: GitlabTagAttrs): APIResponse<GitlabTagData> {
        const path = this.getPath(attrs.id);
        const response = await this.requester.post<GitlabTagData>(path, {params: attrs});
        if (response.status == 201) {
            console.log(`Tagging was finished successfully. Branch: ${response.data.target}`)
        } else {
            throw new Error(`Tagging service error. status code = ${response.status}`);
        }
        return response;
    }
    getPath(projectId: string): string {
        return `/projects/${projectId}/repository/tag`;
    }
}