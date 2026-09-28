import { database } from "@soul/database";

class AdminUserRepository {
  async findMany(params: { search?: string; limit: number; offset: number }) {
    const where = params.search
      ? {
          OR: [
            {
              email: {
                contains: params.search,
                mode: "insensitive" as const,
              },
            },
            {
              profile: {
                nickname: {
                  contains: params.search,
                  mode: "insensitive" as const,
                },
              },
            },
          ],
        }
      : {};

    const [rows, total] = await Promise.all([
      database.user.findMany({
        where,
        include: {
          profile: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: params.limit,
        skip: params.offset,
      }),
      database.user.count({ where }),
    ]);

    return {
      total,
      users: rows.map((user) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
        profile: user.profile
          ? {
              id: user.profile.id,
              nickname: user.profile.nickname,
              avatar: user.profile.avatar,
            }
          : null,
      })),
    };
  }

  async setBlocked(userId: string, isBlocked: boolean) {
    return database.user.update({
      where: { id: userId },
      data: { isBlocked },
    });
  }

  async setRole(userId: string, role: "USER" | "ADMIN") {
    return database.user.update({
      where: { id: userId },
      data: { role },
    });
  }
}

export const adminUserRepository = new AdminUserRepository();
