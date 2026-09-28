import { useEffect, useState } from "react";

import type { FormEvent } from "react";

import Modal from "../../components/ui/Modal";

import {
  createAdminCharacter,
  deleteAdminCharacter,
  getAdminCharacters,
  updateAdminCharacter,
  type AdminCharacter,
  type AdminCharacterInput,
} from "../../services/api/admin";

type FormState = {
  slug: string;
  name: string;
  image: string;
  farmila: string;
  perekup: string;
  tuller: string;
  abilityId: string;
  abilityName: string;
  abilityDescription: string;
};

const EMPTY_FORM: FormState = {
  slug: "",
  name: "",
  image: "",
  farmila: "0",
  perekup: "0",
  tuller: "0",
  abilityId: "",
  abilityName: "",
  abilityDescription: "",
};

function characterToForm(character: AdminCharacter): FormState {
  return {
    slug: character.slug,
    name: character.name,
    image: character.image ?? "",
    farmila: String(character.farmila),
    perekup: String(character.perekup),
    tuller: String(character.tuller),
    abilityId: character.abilityId ?? "",
    abilityName: character.abilityName ?? "",
    abilityDescription: character.abilityDescription ?? "",
  };
}

function formToInput(form: FormState): AdminCharacterInput {
  return {
    slug: form.slug.trim(),
    name: form.name.trim(),
    image: form.image.trim() || null,
    farmila: Number(form.farmila) || 0,
    perekup: Number(form.perekup) || 0,
    tuller: Number(form.tuller) || 0,
    abilityId: form.abilityId.trim() || null,
    abilityName: form.abilityName.trim() || null,
    abilityDescription: form.abilityDescription.trim() || null,
  };
}

function AdminCharacters() {
  const [characters, setCharacters] = useState<AdminCharacter[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const [formError, setFormError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  async function load() {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAdminCharacters();
      setCharacters(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить персонажей",
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
    setIsModalOpen(true);
  }

  function openEdit(character: AdminCharacter) {
    setEditingId(character.id);
    setForm(characterToForm(character));
    setFormError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setIsModalOpen(false);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setFormError(null);

    if (!form.slug.trim() || form.slug.trim().length < 2) {
      setFormError("Slug обязателен (минимум 2 символа)");
      return;
    }

    if (!form.name.trim()) {
      setFormError("Имя обязательно");
      return;
    }

    const input = formToInput(form);

    setIsSaving(true);

    try {
      if (editingId) {
        const updated = await updateAdminCharacter(editingId, input);

        setCharacters((prev) =>
          prev.map((c) => (c.id === editingId ? updated : c)),
        );
      } else {
        const created = await createAdminCharacter(input);

        setCharacters((prev) => [...prev, created]);
      }

      closeModal();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Не удалось сохранить персонажа",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(character: AdminCharacter) {
    if (
      !window.confirm(
        `Удалить персонажа «${character.name}»? Действие необратимо.`,
      )
    ) {
      return;
    }

    try {
      await deleteAdminCharacter(character.id);

      setCharacters((prev) => prev.filter((c) => c.id !== character.id));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Не удалось удалить");
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <p className="admin-page__eyebrow">ПЕРСОНАЖИ</p>

        <h1 className="admin-page__title">Управление персонажами</h1>
      </header>

      <div className="admin-toolbar">
        <button
          className="admin-button admin-button--primary"
          type="button"
          onClick={openCreate}
        >
          + Добавить персонажа
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

      {!isLoading && !error && characters.length === 0 && (
        <p className="admin-empty">Пока нет ни одного персонажа</p>
      )}

      {!isLoading && !error && characters.length > 0 && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Slug</th>
                <th>Имя</th>
                <th>Фармила</th>
                <th>Перекуп</th>
                <th>Туллер</th>
                <th>Способность</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {characters.map((character) => (
                <tr key={character.id}>
                  <td>
                    <code>{character.slug}</code>
                  </td>
                  <td>
                    <strong>{character.name}</strong>
                  </td>
                  <td>{character.farmila}</td>
                  <td>{character.perekup}</td>
                  <td>{character.tuller}</td>
                  <td>{character.abilityName ?? "—"}</td>
                  <td className="admin-table__actions">
                    <button
                      className="admin-button admin-button--small"
                      type="button"
                      onClick={() => openEdit(character)}
                    >
                      Изменить
                    </button>

                    <button
                      className="admin-button admin-button--small admin-button--danger"
                      type="button"
                      onClick={() => void handleDelete(character)}
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
          title={editingId ? "Редактировать персонажа" : "Новый персонаж"}
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
                form="character-form"
                disabled={isSaving}
              >
                {isSaving ? "Сохраняем…" : "Сохранить"}
              </button>
            </>
          }
        >
          <form
            className="modal__form"
            id="character-form"
            onSubmit={handleSubmit}
          >
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
                  placeholder="killer"
                  required
                />
              </div>

              <div className="modal__field">
                <label className="modal__label">Имя</label>

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
                  placeholder="Киллер"
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
                placeholder="/cards/characters/killer.webp"
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

            <div className="modal__field">
              <label className="modal__label">Способность — ID</label>

              <input
                className="admin-input"
                type="text"
                value={form.abilityId}
                onChange={(event) =>
                  setForm({
                    ...form,
                    abilityId: event.target.value,
                  })
                }
                placeholder="cold-blooded"
              />
            </div>

            <div className="modal__field">
              <label className="modal__label">Способность — название</label>

              <input
                className="admin-input"
                type="text"
                value={form.abilityName}
                onChange={(event) =>
                  setForm({
                    ...form,
                    abilityName: event.target.value,
                  })
                }
                placeholder="Хладнокровие"
              />
            </div>

            <div className="modal__field">
              <label className="modal__label">Способность — описание</label>

              <textarea
                className="admin-input admin-input--textarea"
                value={form.abilityDescription}
                onChange={(event) =>
                  setForm({
                    ...form,
                    abilityDescription: event.target.value,
                  })
                }
                rows={3}
              />
            </div>

            {formError && <p className="modal__error">{formError}</p>}
          </form>
        </Modal>
      )}
    </div>
  );
}

export default AdminCharacters;
