import axios from "axios";
import { mocked } from 'ts-jest/utils'
import config from "../src/config";
import GitlabTagService, {GitlabTagData} from "../src/services/tagService";

jest.mock("axios");

const mockedAxios = mocked(axios, true);
mockedAxios.create.mockImplementation(() => mockedAxios);
mockedAxios.post.mockImplementation(
	async (url, data, conf) => {
		return new Promise(
			(resolve, reject) => {
				const responseData = {
					"name": "Received name",
				}
				resolve(responseData);
			});
	});


describe("service tests", () => {
	beforeAll(() => {
		config.gitlabSecret = "test_secret_12345";
	});
	test("Gitlab create tag test", async () => {
		const testedService = new GitlabTagService("test.url", config.gitlabSecret);
		try {
			await testedService.create({
				id: "testId",
				tag_name: "testTag",
				ref: "TestBranchName"
			});
		} catch (e) {
			expect(true).toBe(false);
		}
	})
})