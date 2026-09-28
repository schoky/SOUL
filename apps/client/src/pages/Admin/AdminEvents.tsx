import { useEffect, useState } from "react";

import type { FormEvent } from "react";

import Modal from "../../components/ui/Modal";

import {
  createAdminEvent,
  deleteAdminEvent,
  getAdminEvents,
  updateAdminEvent,
  type AdminEvent,
  type AdminEventInput,
} from "../../services/api/admin";

type FormState = {
  slug: string;
  name: string;
  image: string;
  farmila: string;
  perekup: string;
  tuller: string;
  mainStat: string;
  reward: string;
  riskReward: string;
  description: string;
};

const EMPTY_FORM: FormState = {
  slug: "",
  name: "",
  image: "",
  farmila: "0",
  perekup: "0",
  tuller: "0",
  mainStat: "farmila",
  reward: "0",
  riskReward: "0",
  description: "",
};

const MAIN_STAT_OPTIONS = ["farmila", "perekup", "tuller"] as const;

function eventToForm(event: AdminEvent): FormState {
  return {
    slug: event.slug,
    name: event.name,
    image: event.image ?? "",
    farmila: String(event.farmila),
    perekup: String(event.perekup),
    tuller: String(event.tuller),
    mainStat: event.mainStat,
    reward: String(event.reward),
    riskReward: String(event.riskReward),
    description: event.description,
  };
}

function formToInput(form: FormState): AdminEventInput {
  return {
    slug: form.slug.trim(),
    name: form.name.trim(),
    image: form.image.trim() || null,
    farmila: Number(form.farmila) || 0,
    perekup: Number(form.perekup) || 0,
    tuller: Number(form.tuller) || 0,
    mainStat: form.mainStat,
    reward: Number(form.reward) || 0,
    riskReward: Number(form.riskReward) || 0,
    description: form.description.trim(),
  };
}

function AdminEvents() {
  const [events, setEvents] = useState<AdminEvent[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const [formError, setFormError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const [isCreating, setIsCreating] = useState(false);

  async function load() {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAdminEvents();
      setEvents(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Не удалось загрузить события",
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
    setFormError(null);
    setIsCreating(true);
  }

  function openEdit(event: AdminEvent) {
    setEditingId(event.id);
    setForm(eventToForm(event));
    setFormError(null);
    setIsCreating(true);
  }

  function closeModal() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setIsCreating(false);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setFormError(null);

    if (!form.slug.trim() || form.slug.trim().length < 2) {
      setFormError("Slug обязателен (минимум 2 символа)");
      return;
    }

    if (!form.name.trim()) {
      setFormError("Название обязательно");
      return;
    }

    if (!form.description.trim()) {
      setFormError("Описание обязательно");
      return;
    }

    const input = formToInput(form);

    setIsSaving(true);

    try {
      if (editingId) {
        const updated = await updateAdminEvent(editingId, input);

        setEvents((prev) =>
          prev.map((e) => (e.id === editingId ? updated : e)),
        );
      } else {
        const created = await createAdminEvent(input);

        setEvents((prev) => [...prev, created]);
      }

      closeModal();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Не удалось сохранить событие",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(event: AdminEvent) {
    if (
      !window.confirm(`Удалить событие «${event.name}»? Действие необратимо.`)
    ) {
      return;
    }

    try {
      await deleteAdminEvent(event.id);

      setEvents((prev) => prev.filter((e) => e.id !== event.id));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Не удалось удалить");
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <p className="admin-page__eyebrow">СОБЫТИЯ</p>

        <h1 className="admin-page__title">Управление событиями</h1>
      </header>

      <div className="admin-toolbar">
        <button
          className="admin-button admin-button--primary"
          type="button"
          onClick={openCreate}
        >
          + Добавить событие
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

      {!isLoading && !error && events.length === 0 && (
        <p className="admin-empty">Пока нет ни одного события</p>
      )}

      {!isLoading && !error && events.length > 0 && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Slug</th>
                <th>Название</th>
                <th>Требования</th>
                <th>Основная</th>
                <th>Награда</th>
                <th>Риск</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td data-label="Slug">
                    <code>{event.slug}</code>
                  </td>

                  <td data-label="Название">
                    <strong>{event.name}</strong>
                  </td>

                  <td data-label="Требования">
                    {event.farmila} / {event.perekup} / {event.tuller}
                  </td>

                  <td data-label="Основная">{event.mainStat}</td>

                  <td data-label="Награда">+{event.reward}</td>

                  <td data-label="Риск">+{event.riskReward}</td>

                  <td className="admin-table__actions">
                    <button
                      className="admin-button admin-button--small"
                      type="button"
                      onClick={() => openEdit(event)}
                    >
                      Изменить
                    </button>

                    <button
                      className="admin-button admin-button--small admin-button--danger"
                      type="button"
                      onClick={() => void handleDelete(event)}
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

      {isCreating && (
        <Modal
          title={editingId ? "Редактировать событие" : "Новое событие"}
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
                form="event-form"
                disabled={isSaving}
              >
                {isSaving ? "Сохраняем…" : "Сохранить"}
              </button>
            </>
          }
        >
          <form className="modal__form" id="event-form" onSubmit={handleSubmit}>
            <div className="modal__row modal__row--2">
              <div className="modal__field">
                <label className="modal__label">Slug</label>

                <input
                  className="admin-input"
                  type="text"
                  value={form.slug}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      slug: event.target.value,
                    })
                  }
                  placeholder="raid-on-warehouse"
                  required
                />
              </div>

              <div className="modal__field">
                <label className="modal__label">Название</label>

                <input
                  className="admin-input"
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                  placeholder="Рейд на склад"
                  required
                />
              </div>
            </div>

            <div className="modal__field">
              <label className="modal__label">Картинка (URL)</label>

              <input
                className="admin-input"
                type="text"
                value={form.image}
                onChange={(event) =>
                  setForm({
                    ...form,
                    image: event.target.value,
                  })
                }
                placeholder="/cards/events/raid-on-warehouse.webp"
              />
            </div>

            <div className="modal__row">
              <div className="modal__field">
                <label className="modal__label">Фармила</label>

                <input
                  className="admin-input"
                  type="number"
                  value={form.farmila}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      farmila: event.target.value,
                    })
                  }
                />
              </div>

              <div className="modal__field">
                <label className="modal__label">Перекуп</label>

                <input
                  className="admin-input"
                  type="number"
                  value={form.perekup}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      perekup: event.target.value,
                    })
                  }
                />
              </div>

              <div className="modal__field">
                <label className="modal__label">Туллер</label>

                <input
                  className="admin-input"
                  type="number"
                  value={form.tuller}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      tuller: event.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="modal__row modal__row--2">
              <div className="modal__field">
                <label className="modal__label">Основная характеристика</label>

                <select
                  className="admin-input"
                  value={form.mainStat}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      mainStat: event.target.value,
                    })
                  }
                >
                  {MAIN_STAT_OPTIONS.map((option) => (
                    <option value={option} key={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal__field">
                <label className="modal__label">Награда</label>

                <input
                  className="admin-input"
                  type="number"
                  value={form.reward}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      reward: event.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="modal__field">
              <label className="modal__label">Награда за риск</label>

              <input
                className="admin-input"
                type="number"
                value={form.riskReward}
                onChange={(event) =>
                  setForm({
                    ...form,
                    riskReward: event.target.value,
                  })
                }
              />
            </div>

            <div className="modal__field">
              <label className="modal__label">Описание</label>

              <textarea
                className="admin-input admin-input--textarea"
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description: event.target.value,
                  })
                }
                rows={4}
                required
              />
            </div>

            {formError && <p className="modal__error">{formError}</p>}
          </form>
        </Modal>
      )}
    </div>
  );
}

export default AdminEvents;
