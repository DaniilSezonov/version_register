import config from "../config";
import RestAPIService from "./service";
export default class GitlabTagService extends RestAPIService {
    constructor() {
        super(...arguments);
        this.path = `/projects/${config.gitlabProjectId}/repository/tags`;
    }
    async read() {
        return this.requester.get(this.path);
    }
    ;
    async create(attrs) {
        const response = await this.requester.post(this.path, { params: attrs });
        if (response.status == 201) {
            console.log(`Tagging was finished succesfully. Branch: ${response.data.target}`);
        }
        return response;
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFnU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRhZ1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxNQUFNLE1BQU0sV0FBVyxDQUFDO0FBQy9CLE9BQU8sY0FBeUMsTUFBTSxXQUFXLENBQUM7QUFtQ2xFLE1BQU0sQ0FBQyxPQUFPLE9BQU8sZ0JBQWlCLFNBQVEsY0FBYztJQUE1RDs7UUFDSSxTQUFJLEdBQUcsYUFBYSxNQUFNLENBQUMsZUFBZSxrQkFBa0IsQ0FBQztJQVdqRSxDQUFDO0lBVkcsS0FBSyxDQUFDLElBQUk7UUFDTixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFnQixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUFBLENBQUM7SUFDRixLQUFLLENBQUMsTUFBTSxDQUFDLEtBQXFCO1FBQzlCLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQWdCLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBQyxNQUFNLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztRQUN0RixJQUFJLFFBQVEsQ0FBQyxNQUFNLElBQUksR0FBRyxFQUFFO1lBQ3hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkNBQTZDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQTtTQUNuRjtRQUNELE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFBQSxDQUFDO0NBQ0wifQ==