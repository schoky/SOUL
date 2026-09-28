import { useEffect, useState } from "react";

import {
  getAdminUsers,
  setUserBlocked,
  setUserRole,
  type AdminUser,
} from "../../services/api/admin";

import { useAuthStore } from "../../stores/authStore";

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminUsers() {
  const currentUser = useAuthStore((state) => state.user);

  const [users, setUsers] = useState<AdminUser[]>([]);

  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  async function load(query = search) {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAdminUsers({
        search: query || undefined,
        limit: 50,
      });

      setUsers(data.users);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить пользователей",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load("");
  }, []);

  async function handleToggleBlocked(user: AdminUser) {
    try {
      await setUserBlocked(user.id, !user.isBlocked);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isBlocked: !u.isBlocked } : u,
        ),
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "Ошибка");
    }
  }

  async function handleToggleRole(user: AdminUser) {
    const nextRole = user.role === "ADMIN" ? "USER" : "ADMIN";

    if (user.id === currentUser?.id && nextRole === "USER") {
      alert("Нельзя снять роль ADMIN с себя");
      return;
    }

    try {
      await setUserRole(user.id, nextRole);

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u)),
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "Ошибка");
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <p className="admin-page__eyebrow">ПОЛЬЗОВАТЕЛИ</p>

        <h1 className="admin-page__title">Управление аккаунтами</h1>
      </header>

      <div className="admin-toolbar">
        <input
          className="admin-input"
          type="text"
          placeholder="Поиск по email или нику"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <button
          className="admin-button"
          type="button"
          onClick={() => void load(search)}
        >
          Найти
        </button>
      </div>

      {isLoading && <p className="admin-loading">Загружаем…</p>}

      {error && <p className="admin-error">{error}</p>}

      {!isLoading && !error && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ник</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Статус</th>
                <th>Регистрация</th>
                <th>Последний вход</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.profile?.nickname ?? "—"}</td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className={[
                        "admin-badge",
                        user.role === "ADMIN" ? "admin-badge--admin" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span
                      className={[
                        "admin-badge",
                        user.isBlocked
                          ? "admin-badge--danger"
                          : "admin-badge--success",
                      ].join(" ")}
                    >
                      {user.isBlocked ? "Заблокирован" : "Активен"}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>{formatDate(user.lastLoginAt)}</td>
                  <td className="admin-table__actions">
                    <button
                      className="admin-button admin-button--small"
                      type="button"
                      onClick={() => void handleToggleRole(user)}
                    >
                      {user.role === "ADMIN"
                        ? "Снять админа"
                        : "Сделать админом"}
                    </button>

                    <button
                      className={[
                        "admin-button",
                        "admin-button--small",
                        user.isBlocked ? "" : "admin-button--danger",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      type="button"
                      onClick={() => void handleToggleBlocked(user)}
                    >
                      {user.isBlocked ? "Разблокировать" : "Заблокировать"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
