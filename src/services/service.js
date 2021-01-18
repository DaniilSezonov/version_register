import axios from "axios";
export default class RestAPIService {
    constructor(baseUrl, apiToken) {
        this.requester = axios.create({
            baseURL: baseUrl,
            headers: {
                'CONTENT-TYPE': "application/json",
                'PRIVATE-TOKEN': apiToken,
            }
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUF1QyxNQUFNLE9BQU8sQ0FBQztBQUs1RCxNQUFNLENBQUMsT0FBTyxPQUFPLGNBQWM7SUFHL0IsWUFBWSxPQUFlLEVBQUUsUUFBZ0I7UUFDekMsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1lBQzFCLE9BQU8sRUFBRSxPQUFPO1lBQ2hCLE9BQU8sRUFBRTtnQkFDTCxjQUFjLEVBQUUsa0JBQWtCO2dCQUNsQyxlQUFlLEVBQUUsUUFBUTthQUM1QjtTQUNKLENBQUMsQ0FBQTtJQUNOLENBQUM7Q0FNSiJ9