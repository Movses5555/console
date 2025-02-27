import { Container } from "inversify";
import { TYPES } from "./types";

import '../controllers/user.controller';

import IUserService from '../services/interfaces/IUserService';
import UserService from '../services/user.service';

const container = new Container();


container.bind<IUserService>(TYPES.UserService).to(UserService);

export { container };
