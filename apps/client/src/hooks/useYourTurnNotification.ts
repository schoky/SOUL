import { useEffect, useRef } from "react";

type Params = {
  currentPlayerId: string | null;
  userId: string | undefined;
  onYourTurn: () => void;
};

/**
 * Следит за сменой активного игрока.
 *
 * Если activePlayerId стал равен userId
 * (и раньше им не был), вызывает onYourTurn.
 *
 * Первый рендер игнорируется, чтобы не показывать
 * уведомление сразу при загрузке страницы или F5.
 */
export function useYourTurnNotification({
  currentPlayerId,
  userId,
  onYourTurn,
}: Params): void {
  const previousRef = useRef<string | null>(null);

  const onYourTurnRef = useRef(onYourTurn);

  useEffect(() => {
    onYourTurnRef.current = onYourTurn;
  }, [onYourTurn]);

  useEffect(() => {
    const previous = previousRef.current;

    previousRef.current = currentPlayerId;

    if (!userId || !currentPlayerId) {
      return;
    }

    if (previous === null) {
      return;
    }

    if (previous === currentPlayerId) {
      return;
    }

    if (currentPlayerId === userId) {
      onYourTurnRef.current();
    }
  }, [currentPlayerId, userId]);
}
