import { useState } from "react";

type CardImageProps = {
  src: string | undefined;
  fallbackSrc: string;
  alt: string;
  className?: string;
  placeholderLabel?: string;
};

function CardImage({
  src,
  fallbackSrc,
  alt,
  className,
  placeholderLabel,
}: CardImageProps) {
  const [failed, setFailed] = useState(false);

  const resolvedSrc = src ?? fallbackSrc;

  if (failed) {
    return (
      <div
        className={[className, "card-image", "card-image--placeholder"]
          .filter(Boolean)
          .join(" ")}
        aria-label={alt}
      >
        <span className="card-image__placeholder-label">
          {placeholderLabel ?? alt}
        </span>
      </div>
    );
  }

  return (
    <img
      className={[className, "card-image"].filter(Boolean).join(" ")}
      src={resolvedSrc}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default CardImage;
