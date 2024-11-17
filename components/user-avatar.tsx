import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

// Define the type for the user prop
interface User {
  name: string;
  imageUrl?: string | null; // imageUrl could be optional or null
}

interface UserAvatarProps {
  user: User | null; // user could be null if not assigned
}


const UserAvatar: React.FC<UserAvatarProps> = ({ user }) => {
  return (
    <div className="flex items-center space-x-2 w-full">
      <Avatar className="h-6 w-6">
        <AvatarImage src={user?.imageUrl ?? ""} alt={user?.name ?? "User Avatar"} />
        <AvatarFallback className="capitalize">
          {user ? user.name : "?"}
        </AvatarFallback>
      </Avatar>
      <span className="text-xs text-gray-500">
        {user ? user.name : "Unassigned"}
      </span>
    </div>
  );
};

export default UserAvatar;
