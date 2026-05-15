import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ProfileResponse {
  success: boolean;
  message?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
  };
}

export const getProfile = async (userId: number): Promise<ProfileResponse> => {
  if (!userId) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!user) {
    return {
      success: false,
      message: "User not found",
    };
  }

  return {
    success: true,
    user,
  };
};
