import { Container } from "inversify";
import { TYPES } from "./types";


import AuthService from '../services/auth.service';
import IAuthService from '../services/interfaces/IAuthService';
import UserService from '../services/user.service';
import IUserService from '../services/interfaces/IUserService';
import { UserRepository } from "../repositories/user-repository";
import { IUserRepository } from "../repositories/interfaces/IUserRepository";


import '../controllers/auth.controller';
import '../controllers/user.controller';


const container = new Container();

container.bind<IAuthService>(TYPES.AuthService).to(AuthService);
container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);
container.bind<IUserService>(TYPES.UserService).to(UserService);

export default container;
