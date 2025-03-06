
export default class TelegramUser {
  constructor(
    public id: number,
    public firstName?: string,
    public username?: string,
    public photo_url?: string,
    public authDate?: number,
    public hash?: string,
  ) {}
}
