import { GraphQLResolveInfo } from 'graphql';
import fieldsToRelations from 'graphql-fields-to-relations';

export const verificationDigit = (myNit: string) => {
  let vpri, x: number, y: any, z: number;

  vpri = new Array(16);
  z = myNit.length;

  vpri[1] = 3;
  vpri[2] = 7;
  vpri[3] = 13;
  vpri[4] = 17;
  vpri[5] = 19;
  vpri[6] = 23;
  vpri[7] = 29;
  vpri[8] = 37;
  vpri[9] = 41;
  vpri[10] = 43;
  vpri[11] = 47;
  vpri[12] = 53;
  vpri[13] = 59;
  vpri[14] = 67;
  vpri[15] = 71;

  x = 0;
  y = 0;
  for (let i = 0; i < z; i++) {
    y = myNit.substr(i, 1);

    x += y * vpri[z - i];
  }

  y = x % 11;

  return y > 1 ? 11 - y : y;
};
export const cleanObject = (object: { [key: string]: any } = {}) => {
  Object.entries(object).forEach(([k, v]) => {
    if (v && typeof v === 'object') cleanObject(v);
    if (
      (v && typeof v === 'object' && !Object.keys(v).length) ||
      v === null ||
      v === undefined ||
      v.length === 0
    ) {
      // if (Array.isArray(object)) object.splice(k, 1);
      /*else*/ if (!(v instanceof Date)) delete object[k];
    }
  });
  return object;
};
export const setEmptyObject = (object: { [key: string]: any } = {}) => {
  Object.entries(object).forEach(([k, v]) => {
    if (v && typeof v === 'object') setEmptyObject(v);
    if (
      (v && typeof v === 'object' && !Object.keys(v).length) ||
      v === null ||
      v === undefined ||
      v.length === 0
    ) {
      if (!(v instanceof Date)) object[k] = '';
    }
  });
  return object;
};

export const infoMapper = (info: GraphQLResolveInfo, name: string) => {
  const relationPaths: string[] = fieldsToRelations(info as any).filter(
    (field) => field !== name
  );

  const newRelations = relationPaths.map((word) => {
    const newWord = word.split('.');
    newWord.shift();
    return newWord.join('.');
  });
  return newRelations;
};
