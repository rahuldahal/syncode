export const PICTURE_API: string = 'https://ui-avatars.com/api/?name=';

interface GenericObject {
  [key: string]: string;
}

export const errorMessages: GenericObject = {
  DUPLICATE_CREDENTIALS: 'Duplicate Credentials!',
  NO_USER: 'User does not exist!',
  INVALID_PASSWORD: 'Invalid Password!',
};
