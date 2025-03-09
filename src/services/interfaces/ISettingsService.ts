
export default interface ISettingsService {
  getSettingsValueByKey(key: string): Promise<number>;
}

