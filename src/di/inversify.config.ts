import { Container } from "inversify";
import { TYPES } from "./types";
import { Pool } from 'pg';
import pool from '../config/db';

import AuthService from '../services/auth.service';
import IAuthService from '../services/interfaces/IAuthService';
import UserService from '../services/user.service';
import MiningService from '../services/mining.service';
import IMiningService from '../services/interfaces/IMiningService';
import IUserService from '../services/interfaces/IUserService';
import SettingsService from "../services/settings.service";
import ISettingsService from "../services/interfaces/ISettingsService";
import Repository from "../repositories/repository";
import { IRepository } from "../repositories/interfaces/IRepository";

import '../controllers/auth.controller';
import '../controllers/user.controller';


const container = new Container();

container.bind<Pool>('Pool').toConstantValue(pool);


container.bind<IRepository>(TYPES.Repository).to(Repository);
container.bind<IAuthService>(TYPES.AuthService).to(AuthService);
container.bind<IUserService>(TYPES.UserService).to(UserService);
container.bind<IMiningService>(TYPES.MiningService).to(MiningService);
container.bind<ISettingsService>(TYPES.SettingsService).to(SettingsService);

export default container;
