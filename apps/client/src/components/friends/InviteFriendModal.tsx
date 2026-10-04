import { useEffect, useMemo, useState } from "react";

import Modal from "../ui/Modal";

import { useFriendsStore } from "../../stores/friendsStore";
import { useToastStore } from "../../stores/toastStore";

import { sendRoomInvitation } from "../../services/api/invitations";

type InviteFriendModalProps = {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomCode: string;
};

function InviteFriendModal({
  isOpen,
  onClose,
  roomId,
  roomCode,
}: InviteFriendModalProps) {
  const friends = useFriendsStore((state) => state.friends);

  const pushToast = useToastStore((state) => state.push);

  const [processingId, setProcessingId] = useState<string | null>(null);

  const [invitedIds, setInvitedIds] = useState<Set<string>>(() => new Set());

  // Сбрасываем локальные «приглашено» при каждом открытии.
  useEffect(() => {
    if (isOpen) {
      setInvitedIds(new Set());
      setProcessingId(null);
    }
  }, [isOpen]);

  const sortedFriends = useMemo(() => {
    return [...friends].sort((a, b) => {
      if (a.isOnline === b.isOnline) {
        return a.nickname.localeCompare(b.nickname, "ru");
      }

      return a.isOnline ? -1 : 1;
    });
  }, [friends]);

  const onlineCount = useMemo(
    () => friends.filter((f) => f.isOnline).length,
    [friends],
  );

  async function handleInvite(friendUserId: string) {
    setProcessingId(friendUserId);

    try {
      await sendRoomInvitation(roomId, friendUserId);

      setInvitedIds((prev) => {
        const next = new Set(prev);

        next.add(friendUserId);

        return next;
      });

      const friend = friends.find((f) => f.userId === friendUserId);

      pushToast(
        "success",
        `Приглашение отправлено: ${friend?.nickname ?? "друг"}`,
      );
    } catch (error) {
      pushToast(
        "error",
        error instanceof Error
          ? error.message
          : "Не удалось отправить приглашение",
      );
    } finally {
      setProcessingId(null);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <Modal title={`Пригласить в комнату ${roomCode}`} onClose={onClose}>
      {friends.length === 0 ? (
        <p className="invite-modal__empty">
          У тебя пока нет друзей. Добавь кого-нибудь на странице{" "}
          <strong>«Друзья»</strong>.
        </p>
      ) : (
        <>
          <p className="invite-modal__hint">
            Онлайн сейчас:{" "}
            <strong>
              {onlineCount} из {friends.length}
            </strong>
          </p>

          <ul className="invite-modal__list">
            {sortedFriends.map((friend) => {
              const isInvited = invitedIds.has(friend.userId);

              const isProcessing = processingId === friend.userId;

              return (
                <li className="invite-modal__item" key={friend.userId}>
                  <div className="invite-modal__avatar-wrap">
                    {friend.avatar ? (
                      <img
                        className="invite-modal__avatar"
                        src={friend.avatar}
                        alt={friend.nickname}
                      />
                    ) : (
                      <div className="invite-modal__avatar invite-modal__avatar--placeholder">
                        {friend.nickname[0]?.toUpperCase() ?? "?"}
                      </div>
                    )}

                    {friend.isOnline && (
                      <span
                        className="invite-modal__online-dot"
                        title="Онлайн"
                      />
                    )}
                  </div>

                  <div className="invite-modal__info">
                    <strong className="invite-modal__name">
                      {friend.nickname}
                    </strong>

                    <span className="invite-modal__status">
                      {friend.isOnline ? "В сети" : "Не в сети"}
                    </span>
                  </div>

                  <button
                    className={[
                      "invite-modal__button",
                      isInvited ? "invite-modal__button--invited" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    type="button"
                    disabled={isInvited || isProcessing}
                    onClick={() => {
                      void handleInvite(friend.userId);
                    }}
                  >
                    {isInvited
                      ? "Приглашён"
                      : isProcessing
                        ? "Отправляем…"
                        : "Пригласить"}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Modal>
  );
}

export default InviteFriendModal;
