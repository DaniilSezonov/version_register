import axios from "axios";
import { mocked } from 'ts-jest/utils'
import config from "../src/config";
import GitlabTagService from "../src/services/tagService";
import {ServiceError} from "../src/errors";

jest.mock("axios");

const mockedResponse = {
	target: "32b87da92b1682f6cfc1f77b5bbabb219a78f37d",
	name: "test_tag",
}
const mockedAxios = mocked(axios, true);
mockedAxios.create.mockImplementation(() => mockedAxios);

describe("service tests", () => {
	beforeAll(() => {
		config.gitlabSecret = "test_secret_12345";
	});
	test("Gitlab create tag test", async () => {
		mockedAxios.post.mockImplementation(
			(url, data, conf) => {
				return new Promise(
					(resolve, reject) => {
						resolve(mockedResponse);
					});
			});
		const testedService = new GitlabTagService("test.url", config.gitlabSecret);
		try {
			const response = await testedService.create({
				id: "testId",
				tag_name: mockedResponse.name,
				ref: "branch-name"
			});
		} catch (e) {
			expect(true).toBe(false);
		}
	});
	test("Gitlab create tag with bad request", async () => {
		mockedAxios.post.mockImplementation(
			(url, data, conf) => {
				return new Promise(((resolve, reject) => {
					reject({message: "BadRequest"})
				}));
		});
		const testedService = new GitlabTagService("test.url", config.gitlabSecret);
		try {
			await testedService.create({
				id: "testId",
				tag_name: mockedResponse.name,
				ref: "branch-name"
			})
		} catch (e) {
			expect(e).toBeInstanceOf(ServiceError);
		}
	});
})