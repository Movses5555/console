import { Container } from "inversify";
import { TYPES } from "./types";


import { UserService } from '../services/user.service';
import { UserRepository } from "../repositories/user-repository";
import IUserService from '../services/interfaces/IUserService';
import { IUserRepository } from "../repositories/interfaces/IUserRepository";




import '../controllers/user.controller';




const container = new Container();

container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);
container.bind<IUserService>(TYPES.UserService).to(UserService);

export default container;
