import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import Modal from "../../components/ui/Modal";

import {
  type AdminNewsInput,
  type AdminNewsItem,
  createAdminNews,
  deleteAdminNews,
  getAdminNews,
  updateAdminNews,
} from "../../services/api/admin";

import { slugify } from "../../utils/slugify";

type FormState = {
  slug: string;
  title: string;
  body: string;
  isPublished: boolean;
};

const EMPTY_FORM: FormState = {
  slug: "",
  title: "",
  body: "",
  isPublished: false,
};

function itemToForm(item: AdminNewsItem): FormState {
  return {
    slug: item.slug,
    title: item.title,
    body: item.body,
    isPublished: item.isPublished,
  };
}

function formToInput(form: FormState): AdminNewsInput {
  return {
    slug: form.slug.trim(),
    title: form.title.trim(),
    body: form.body.trim(),
    isPublished: form.isPublished,
  };
}

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

function AdminNews() {
  const [items, setItems] = useState<AdminNewsItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  async function load() {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAdminNews();
      setItems(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Не удалось загрузить новости",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSlugManuallyEdited(false);
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEdit(item: AdminNewsItem) {
    setEditingId(item.id);
    setForm(itemToForm(item));
    // При редактировании существующей новости
    // slug уже задан — считаем его «ручным»,
    // чтобы авто-генерация не перезаписала URL.
    setSlugManuallyEdited(true);
    setFormError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSlugManuallyEdited(false);
    setFormError(null);
    setIsModalOpen(false);
  }

  function handleTitleChange(value: string) {
    setForm((prev) => {
      if (!slugManuallyEdited) {
        return {
          ...prev,
          title: value,
          slug: slugify(value),
        };
      }

      return { ...prev, title: value };
    });
  }

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true);

    setForm((prev) => ({
      ...prev,
      slug: value,
    }));
  }

  function handleRegenerateSlug() {
    setForm((prev) => ({
      ...prev,
      slug: slugify(prev.title),
    }));

    setSlugManuallyEdited(false);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setFormError(null);

    const slug = form.slug.trim();

    if (!slug || slug.length < 2) {
      setFormError("Slug обязателен (минимум 2 символа)");
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setFormError(
        "Slug может содержать только латиницу в нижнем регистре, цифры и дефис",
      );
      return;
    }

    if (!form.title.trim()) {
      setFormError("Заголовок обязателен");
      return;
    }

    if (!form.body.trim()) {
      setFormError("Текст новости обязателен");
      return;
    }

    const input = formToInput(form);

    setIsSaving(true);

    try {
      if (editingId) {
        const updated = await updateAdminNews(editingId, input);

        setItems((prev) =>
          prev.map((item) => (item.id === editingId ? updated : item)),
        );
      } else {
        const created = await createAdminNews(input);

        setItems((prev) => [created, ...prev]);
      }

      closeModal();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Не удалось сохранить новость",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTogglePublish(item: AdminNewsItem) {
    try {
      const updated = await updateAdminNews(item.id, {
        isPublished: !item.isPublished,
      });

      setItems((prev) =>
        prev.map((entry) => (entry.id === item.id ? updated : entry)),
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Не удалось изменить публикацию",
      );
    }
  }

  async function handleDelete(item: AdminNewsItem) {
    if (
      !window.confirm(`Удалить новость «${item.title}»? Действие необратимо.`)
    ) {
      return;
    }

    try {
      await deleteAdminNews(item.id);

      setItems((prev) => prev.filter((entry) => entry.id !== item.id));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Не удалось удалить");
    }
  }

  const previewUrl = useMemo(() => {
    if (!form.slug.trim()) {
      return null;
    }

    return `/news/${form.slug.trim()}`;
  }, [form.slug]);

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <p className="admin-page__eyebrow">НОВОСТИ</p>

        <h1 className="admin-page__title">Управление новостями</h1>
      </header>

      <div className="admin-toolbar">
        <button
          className="admin-button admin-button--primary"
          type="button"
          onClick={openCreate}
        >
          + Добавить новость
        </button>

        <button
          className="admin-button"
          type="button"
          onClick={() => void load()}
        >
          Обновить
        </button>
      </div>

      {isLoading && <p className="admin-loading">Загружаем…</p>}

      {error && <p className="admin-error">{error}</p>}

      {!isLoading && !error && items.length === 0 && (
        <p className="admin-empty">Пока нет ни одной новости</p>
      )}

      {!isLoading && !error && items.length > 0 && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Slug</th>
                <th>Заголовок</th>
                <th>Статус</th>
                <th>Опубликована</th>
                <th>Создана</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td data-label="Slug">
                    <code>{item.slug}</code>
                  </td>

                  <td data-label="Заголовок">
                    <strong>{item.title}</strong>
                  </td>

                  <td data-label="Статус">
                    <span
                      className={[
                        "admin-badge",
                        item.isPublished
                          ? "admin-badge--success"
                          : "admin-badge--warning",
                      ].join(" ")}
                    >
                      {item.isPublished ? "Опубликована" : "Черновик"}
                    </span>
                  </td>

                  <td data-label="Опубликована">
                    {formatDate(item.publishedAt)}
                  </td>

                  <td data-label="Создана">{formatDate(item.createdAt)}</td>

                  <td className="admin-table__actions">
                    <button
                      className="admin-button admin-button--small"
                      type="button"
                      onClick={() => openEdit(item)}
                    >
                      Изменить
                    </button>

                    <button
                      className="admin-button admin-button--small"
                      type="button"
                      onClick={() => void handleTogglePublish(item)}
                    >
                      {item.isPublished ? "Снять" : "Опубликовать"}
                    </button>

                    <button
                      className="admin-button admin-button--small admin-button--danger"
                      type="button"
                      onClick={() => void handleDelete(item)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <Modal
          title={editingId ? "Редактировать новость" : "Новая новость"}
          onClose={closeModal}
          footer={
            <>
              <button
                className="admin-button"
                type="button"
                onClick={closeModal}
                disabled={isSaving}
              >
                Отмена
              </button>

              <button
                className="admin-button admin-button--primary"
                type="submit"
                form="news-form"
                disabled={isSaving}
              >
                {isSaving ? "Сохраняем…" : "Сохранить"}
              </button>
            </>
          }
        >
          <form className="modal__form" id="news-form" onSubmit={handleSubmit}>
            <div className="modal__field">
              <label className="modal__label">Заголовок</label>

              <input
                className="admin-input"
                type="text"
                value={form.title}
                onChange={(event) => handleTitleChange(event.target.value)}
                placeholder="Например: Обновление 1.2"
                maxLength={200}
                required
              />
            </div>

            <div className="modal__field">
              <label className="modal__label">Slug (часть URL)</label>

              <div className="admin-slug-row">
                <input
                  className="admin-input admin-slug-row__input"
                  type="text"
                  value={form.slug}
                  onChange={(event) => handleSlugChange(event.target.value)}
                  placeholder="update-1-2"
                  maxLength={80}
                  required
                />

                <button
                  className="admin-button admin-button--small"
                  type="button"
                  onClick={handleRegenerateSlug}
                  disabled={!form.title.trim()}
                  title="Сгенерировать slug из заголовка"
                >
                  Из заголовка
                </button>
              </div>

              {previewUrl ? (
                <span className="admin-slug-preview">
                  Ссылка:{" "}
                  <code>
                    <span className="admin-slug-preview__domain">
                      soul.example.ru
                    </span>
                    {previewUrl}
                  </code>
                </span>
              ) : (
                <span className="admin-hint">
                  Slug генерируется автоматически из заголовка, но его можно
                  отредактировать вручную. Разрешены латиница, цифры и дефис.
                </span>
              )}
            </div>

            <div className="modal__field">
              <label className="modal__label">Текст новости</label>

              <textarea
                className="admin-input admin-input--textarea"
                value={form.body}
                onChange={(event) =>
                  setForm({
                    ...form,
                    body: event.target.value,
                  })
                }
                rows={12}
                placeholder="Абзацы разделяются пустой строкой."
                required
              />

              <span className="admin-hint">
                Абзацы разделяются пустой строкой. Разметка не поддерживается —
                только текст.
              </span>
            </div>

            <label className="modal__checkbox">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(event) =>
                  setForm({
                    ...form,
                    isPublished: event.target.checked,
                  })
                }
              />

              <span>Опубликовать сразу</span>
            </label>

            {formError && <p className="modal__error">{formError}</p>}
          </form>
        </Modal>
      )}
    </div>
  );
}

export default AdminNews;
