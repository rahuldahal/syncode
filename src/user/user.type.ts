export interface TUserBase {
  id: number;
  username: string;
}

export interface TUser extends TUserBase {
  picture: string;
  firstname: string | null;
  lastname: string | null;
  createdAt: Date;
  updatedAt: Date;
}
