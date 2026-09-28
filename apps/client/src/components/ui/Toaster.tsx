import { useToastStore } from "../../stores/toastStore";

function Toaster() {
  const toasts = useToastStore((state) => state.toasts);

  const dismiss = useToastStore((state) => state.dismiss);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toaster" aria-live="polite">
      {toasts.map((toast) => (
        <div
          className={["toaster__item", `toaster__item--${toast.kind}`].join(
            " ",
          )}
          key={toast.id}
          onClick={() => dismiss(toast.id)}
          role="status"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

export default Toaster;
