import { NavLink, Outlet } from "react-router-dom";

import MainHeader from "../../components/navigation/MainHeader";

const links = [
  { to: "/admin", end: true, label: "Обзор" },
  { to: "/admin/users", label: "Пользователи" },
  { to: "/admin/characters", label: "Персонажи" },
  { to: "/admin/events", label: "События" },
  { to: "/admin/rooms", label: "Комнаты" },
  { to: "/admin/games", label: "Игры" },
  { to: "/admin/news", label: "Новости" },
];

function AdminLayout() {
  return (
    <div className="admin-layout">
      <MainHeader />

      <div className="admin-layout__body">
        <aside className="admin-sidebar">
          <p className="admin-sidebar__eyebrow">АДМИН-ПАНЕЛЬ</p>

          <nav className="admin-sidebar__nav">
            {links.map((link) => (
              <NavLink
                className={({ isActive }) =>
                  [
                    "admin-sidebar__link",
                    isActive ? "admin-sidebar__link--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")
                }
                end={link.end}
                key={link.to}
                to={link.to}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <NavLink className="admin-sidebar__back" to="/lobby">
            ← В игру
          </NavLink>
        </aside>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
