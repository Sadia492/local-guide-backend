import { IUser, Role } from "./users.interface";
import User from "./users.model";

const getSingleUser = async (id: string): Promise<IUser | null> => {
  return await User.findById(id);
};
const getAllUser = async (): Promise<IUser[] | null> => {
  return await User.find({ role: { $ne: "ADMIN" } });
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
const deleteUser = async (userId: string) => {
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Prevent admin from deleting themselves
  if (user.role === Role.ADMIN) {
    throw new Error("Cannot delete admin user");
  }

  const result = await User.findByIdAndDelete(userId);

  return result;
};

const changeUserRole = async (userId: string, newRole: Role) => {
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Validate role transition
  if (user.role === Role.ADMIN && newRole !== Role.ADMIN) {
    throw new Error("Cannot demote admin user");
  }

  // If promoting to guide, ensure they have required fields
  if (newRole === Role.GUIDE && user.role === Role.TOURIST) {
    // Add default expertise if not present
    if (!user.expertise || user.expertise.length === 0) {
      user.expertise = ["General"];
    }

    // Set default daily rate if not present
    if (!user.dailyRate) {
      user.dailyRate = 50; // Default rate
    }

    // Clear tourist-specific fields
    user.travelPreferences = [];
  }

  // If demoting to tourist, clear guide-specific fields
  if (newRole === Role.TOURIST && user.role === Role.GUIDE) {
    user.expertise = [];
    user.dailyRate = undefined;
    user.bio = user.bio || ""; // Keep bio as it can be for tourists too
  }

  // Update the role
  user.role = newRole;

  const result = await user.save();

  return result;
};

const toggleUserStatus = async (userId: string, isActive: boolean) => {
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Prevent deactivating admin
  if (user.role === Role.ADMIN && !isActive) {
    throw new Error("Cannot deactivate admin user");
  }

  // Prevent self-deactivation
  // This check should be done in controller with currentUser
  // if (currentUser._id.toString() === userId && !isActive) {
  //   throw new Error("Cannot deactivate your own account");
  // }

  // Update status
  user.isActive = isActive;

  // If deactivating, also set verified to false
  if (!isActive) {
    user.isVerified = false;
  }

  const result = await user.save();

  return result;
};

export const userService = {
  getMe,
  getSingleUser,
  updateUser,
  getAllUser,
  deleteUser,
  changeUserRole,
  toggleUserStatus,
};
