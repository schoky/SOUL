type SkeletonProps = {
  width?: string | number;
  height?: string | number;
  radius?: string;
  className?: string;
};

function Skeleton({ width, height, radius, className }: SkeletonProps) {
  return (
    <span
      className={['skeleton', className].filter(Boolean).join(' ')}
      style={{
        width,
        height,
        borderRadius: radius
      }}
      aria-hidden='true'
    />
  );
}

export default Skeleton;
