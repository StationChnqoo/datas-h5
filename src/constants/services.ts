import axios, { AxiosInstance } from 'axios';

export default class Services {
  // @ts-ignore
  instance: AxiosInstance = null;
  constructor() {
    const time = Date.now();
    this.instance = axios.create({
      // baseURL: Config.SERVER,
      baseURL: 'https://service.cctv3.net',
      timeout: 10000,
      headers: {},
      withCredentials: false,
    });
    let couldPrintPaths = [];
    this.instance.interceptors.response.use((response: any) => {
      return response;
    });
  }

  async selectTestMongoFilms(current: number, pageSize: number) {
    return this.instance.get(`/api/testMongo?current=${current}&pageSize=${pageSize}`);
  }
}
