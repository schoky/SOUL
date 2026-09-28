import type { FastifyPluginAsync, FastifyReply } from "fastify";

import type { OAuthProvider } from "@soul/database";

import { createUserSession } from "../sessionService.js";

import {
  buildAuthorizeUrl,
  exchangeCodeForToken,
  fetchUserInfo,
  generateState,
} from "./oauthService.js";

import {
  createOAuthUser,
  findOAuthAccount,
  findUserByEmail,
  linkOAuthAccount,
} from "./oauthAccountRepository.js";

import { getClientUrl, isOAuthProvider } from "./oauthProviders.js";

const SESSION_COOKIE = "soul_session";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

const STATE_COOKIE_PREFIX = "oauth_state_";

const STATE_MAX_AGE = 10 * 60;

function stateCookieName(provider: OAuthProvider): string {
  return `${STATE_COOKIE_PREFIX}${provider.toLowerCase()}`;
}

const oauthRoutes: FastifyPluginAsync = async (app) => {
  /**
   * Шаг 1. Редирект на страницу провайдера.
   */
  app.get<{
    Params: { provider: string };
  }>("/:provider", async (request, reply) => {
    const raw = request.params.provider.toUpperCase();

    if (!isOAuthProvider(raw)) {
      return reply.code(404).send({
        error: `Unknown OAuth provider: ${request.params.provider}`,
      });
    }

    const state = generateState();

    reply.setCookie(stateCookieName(raw), state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: STATE_MAX_AGE,
    });

    const authorizeUrl = buildAuthorizeUrl(raw, state);

    return reply.redirect(authorizeUrl);
  });

  /**
   * Шаг 2. Обработка callback от провайдера.
   */
  app.get<{
    Params: { provider: string };
    Querystring: {
      code?: string;
      state?: string;
      error?: string;
      error_description?: string;
    };
  }>("/:provider/callback", async (request, reply) => {
    const raw = request.params.provider.toUpperCase();

    if (!isOAuthProvider(raw)) {
      return reply.code(404).send({
        error: `Unknown OAuth provider: ${request.params.provider}`,
      });
    }

    const provider: OAuthProvider = raw;

    const query = request.query;

    if (query.error) {
      return redirectWithError(
        reply,
        query.error_description ?? query.error ?? "OAuth failed",
      );
    }

    const code = query.code;

    const state = query.state;

    if (!code || !state) {
      return redirectWithError(reply, "Missing code or state");
    }

    const cookieName = stateCookieName(provider);

    const storedState = request.cookies[cookieName];

    reply.clearCookie(cookieName, { path: "/" });

    if (!storedState || storedState !== state) {
      return redirectWithError(reply, "Invalid OAuth state");
    }

    try {
      const accessToken = await exchangeCodeForToken(provider, code);

      const info = await fetchUserInfo(provider, accessToken);

      if (!info.providerUserId) {
        return redirectWithError(
          reply,
          "OAuth provider did not return a user id",
        );
      }

      // 1. Ищем привязку OAuth → User
      const existing = await findOAuthAccount(provider, info.providerUserId);

      let userId: string;

      if (existing) {
        userId = existing.userId;
      } else {
        // 2. Пробуем связать с существующим
        //    пользователем по email
        const userByEmail = info.email
          ? await findUserByEmail(info.email)
          : null;

        if (userByEmail) {
          await linkOAuthAccount(userByEmail.id, {
            provider,
            providerUserId: info.providerUserId,
            email: info.email,
            nickname: info.nickname,
            avatar: info.avatar,
          });

          userId = userByEmail.id;
        } else {
          // 3. Создаём нового пользователя
          const created = await createOAuthUser({
            provider,
            providerUserId: info.providerUserId,
            email: info.email,
            nickname: info.nickname,
            avatar: info.avatar,
          });

          userId = created.id;
        }
      }

      const session = await createUserSession({
        userId,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      });

      reply.setCookie(SESSION_COOKIE, session.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: SESSION_MAX_AGE,
      });

      return reply.redirect(`${getClientUrl()}/lobby`);
    } catch (error) {
      request.log.error(error);

      return redirectWithError(
        reply,
        error instanceof Error ? error.message : "OAuth login failed",
      );
    }
  });
};

function redirectWithError(reply: FastifyReply, message: string): void {
  const url = new URL(`${getClientUrl()}/login`);

  url.searchParams.set("oauthError", message);

  reply.redirect(url.toString());
}

export default oauthRoutes;
