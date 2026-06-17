type RemoteImageProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  loading?: "eager" | "lazy";
};

export default function RemoteImage({
  src,
  alt,
  className,
  fill = false,
  width,
  height,
  loading = "lazy",
}: RemoteImageProps) {
  if (fill) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
    />
  );
}
