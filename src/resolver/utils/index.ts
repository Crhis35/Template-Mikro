import { createWriteStream } from 'fs';
import { parse } from 'path';
import { join } from 'path';
import { environment } from '../../environment';
import { ensureDirectoryExistence } from '../../utils/services/AppError';
import jwt from 'jsonwebtoken';
import { AuthProvider } from '../../entity/AuthProvider.entity';
import { EntityManager, IDatabaseDriver } from '@mikro-orm/core';
import { Connection } from '@mikro-orm/core';
import { ApiArgs } from '../input';

const storeUpload = async ({ stream, filename }: any) => {
  ensureDirectoryExistence(`${__dirname}/../images`);
  let { ext, name } = parse(filename);

  name = name.replace(/([^a-z0-9 ]+)/gi, '-').replace(' ', '_');

  let serverFile = join(__dirname, `/../images/${name}-${Date.now()}${ext}`);

  serverFile = serverFile.replace(' ', '_');
  const fileOutput = `images${serverFile.split('images')[1]}`;
  return new Promise((resolve, reject) =>
    stream
      .pipe(createWriteStream(serverFile))
      .on('finish', () => resolve(fileOutput))
      .on('error', reject)
  );
};

export const processUpload = async (upload: any) => {
  const { createReadStream, filename } = await upload;
  const stream = createReadStream();
  const file = await storeUpload({ stream, filename });
  return file;
};

const signToken = (id: string) =>
  jwt.sign({ id }, environment.jwtSecret, {
    expiresIn: environment.jwtExpires,
  });

export const createSendToken = (auth: AuthProvider, res: any) => {
  const token = signToken(auth.id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + environment.jwtCookieExpires * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: false,
  };
  if (environment.env === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  console.log(auth);
  return {
    token,
    auth,
  };
};

export async function APIFeatures(
  Model: Function,
  em: EntityManager<IDatabaseDriver<Connection>>,
  { search, sort, limit, offset }: ApiArgs
) {
  let searchQuery = {};
  let orderBy: any = {};

  if (search) {
    searchQuery = {
      $or: [{ userName: { $re: search } }],
    };
  }
  if (sort) orderBy[sort.field as keyof string] = sort.order === 'ASC' ? 1 : -1;
  const [items, count] = await em
    .getRepository(Model)
    .findAndCount(searchQuery, { limit, offset, orderBy });

  return {
    items,
    totalPages: Math.ceil(count / limit),
    offset,
  };
}
