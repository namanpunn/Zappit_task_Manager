import { currentUser, type User } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { User as PrismaUser } from "@prisma/client";

export const checkUser = async (): Promise<PrismaUser | null> => {
  const user: User | null = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0]?.emailAddress ?? "",
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error checking or creating user:", error);
    return null;
  }
};