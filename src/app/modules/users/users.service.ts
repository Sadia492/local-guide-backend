import { IUser } from "./users.interface";
import User from "./users.model";

const getSingleUser = async (id: string): Promise<IUser | null> => {
  return await User.findById(id);
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  return {
    data: user,
  };
};

const updateUser = async (
  id: string,
  payload: Partial<IUser>
): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).select("-password");
};

export const userService = {
  getMe,
  getSingleUser,
  updateUser,
};
