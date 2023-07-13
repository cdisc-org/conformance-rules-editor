import { IUser } from "../types/IUser";
import { IUsers } from "../types/IUsers";

const getUsersByIds = async (
  ids: string[]
): Promise<{ [id: string]: IUser }> => {
  if (!ids.length) {
    return {};
  }
  const usersList = ids.map((id: string) => ({
    [id]: { id: id, name: "dummyuser" },
  }));
  const usersObject = Object.assign({}, ...usersList);
  return new Promise((resolve, reject) => {
    resolve(usersObject);
  });
};

const getUsersByName = async (name: string): Promise<IUser[]> => {
  const users: IUser[] = [{ id: "dummyuser", name: "dummyuser" }];
  return new Promise((resolve, reject) => {
    resolve(users);
  });
};

const getUserPermissions = async (user: IUser): Promise<IUser> => {
  user.write_allowed = true;
  return new Promise((resolve, reject) => {
    resolve(user);
  });
};

export default {
  getUsersByIds,
  getUsersByName,
  getUserPermissions,
} as IUsers;
