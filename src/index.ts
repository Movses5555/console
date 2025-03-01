import "reflect-metadata";
import 'dotenv/config';
import express, {
  Request,
  Response,
  NextFunction,
} from 'express';
import cors from 'cors';
import { InversifyExpressServer } from 'inversify-express-utils';
import swaggerUi from 'swagger-ui-express';
import errorHandlerMiddleware from './middlewares/error-handler.middleware';
import swaggerDocs from './config/swagger';

import container from './di/inversify.config';

const server = new InversifyExpressServer(container);
server
  .setConfig((app) => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.disable('etag');
    app.use((req: Request, res: Response, next: NextFunction) => {
      // @ts-expect-error Fix later
      req.container = container;
      next();
    });

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  })
  .setErrorConfig((app) => {
    app.use(errorHandlerMiddleware);
  });

const app = server.build();
const port = process.env.PORT;
  
app.listen(port, () => console.log(`App is running on ${port} port`));
