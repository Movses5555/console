export default class AuthCredentials {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
  ) {}
}
