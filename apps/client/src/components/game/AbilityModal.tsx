import { useEffect } from "react";

import type { Character } from "@soul/shared";

type AbilityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  characters: Character[];
  highlightId?: string | null;
};

function AbilityModal({
  isOpen,
  onClose,
  title,
  characters,
  highlightId = null,
}: AbilityModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const withAbility = characters.filter((item) => item.ability);

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal modal--abilities"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>

          <button
            className="modal__close"
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div className="modal__body">
          {withAbility.length === 0 ? (
            <p className="ability-modal__empty">
              У твоих персонажей нет способностей.
            </p>
          ) : (
            <ul className="ability-modal__list">
              {withAbility.map((character) => {
                const isHighlighted = character.id === highlightId;

                return (
                  <li
                    key={character.id}
                    className={[
                      "ability-modal__item",
                      isHighlighted ? "ability-modal__item--highlight" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className="ability-modal__header">
                      <strong className="ability-modal__character">
                        {character.name}
                      </strong>

                      <span className="ability-modal__name">
                        {character.ability!.name}
                      </span>
                    </div>

                    <p className="ability-modal__description">
                      {character.ability!.description}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default AbilityModal;
