import type { FastifyPluginAsync } from "fastify";

import {
  getCurrentUserByToken,
  loginUser,
  logoutUser,
  registerUser,
} from "../../auth/authService.js";

const SESSION_COOKIE = "soul_session";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

type RegisterBody = {
  email: string;
  password: string;
  nickname: string;
  avatar?: string;
};

type LoginBody = {
  email: string;
  password: string;
};

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post<{
    Body: RegisterBody;
  }>(
    "/register",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password", "nickname"],
          additionalProperties: false,
          properties: {
            email: {
              type: "string",
            },
            password: {
              type: "string",
            },
            nickname: {
              type: "string",
            },
            avatar: {
              type: "string",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await registerUser({
          ...request.body,
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"],
        });

        reply.setCookie(SESSION_COOKIE, result.token, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: SESSION_MAX_AGE,
        });

        return reply.code(201).send({
          user: result.user,
        });
      } catch (error) {
        return reply.code(400).send({
          error: error instanceof Error ? error.message : "Registration failed",
        });
      }
    },
  );

  app.post<{
    Body: LoginBody;
  }>(
    "/login",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password"],
          additionalProperties: false,
          properties: {
            email: {
              type: "string",
            },
            password: {
              type: "string",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await loginUser({
          ...request.body,
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"],
        });

        reply.setCookie(SESSION_COOKIE, result.token, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: SESSION_MAX_AGE,
        });

        return reply.send({
          user: result.user,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Login failed";

        const statusCode = message === "User is blocked" ? 403 : 401;

        return reply.code(statusCode).send({
          error: message,
        });
      }
    },
  );

  app.post("/logout", async (request, reply) => {
    const token = request.cookies[SESSION_COOKIE];

    if (token) {
      await logoutUser(token);
    }

    reply.clearCookie(SESSION_COOKIE, {
      path: "/",
    });

    return reply.send({
      success: true,
    });
  });

  app.get("/me", async (request, reply) => {
    const token = request.cookies[SESSION_COOKIE];

    if (!token) {
      return reply.code(401).send({
        error: "Not authenticated",
      });
    }

    const user = await getCurrentUserByToken(token);

    if (!user) {
      reply.clearCookie(SESSION_COOKIE, {
        path: "/",
      });

      return reply.code(401).send({
        error: "Not authenticated",
      });
    }

    return reply.send({
      user,
    });
  });
};

export default authRoutes;
