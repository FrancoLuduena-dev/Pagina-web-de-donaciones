"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./Gallery.module.css";

type Props = {
  images: string[];
  maxImages?: number;
};

export default function Gallery({ images, maxImages = 5 }: Props) {
  const imgs = images.slice(0, maxImages);
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((current) => (current === 0 ? imgs.length - 1 : current - 1));
  const next = () => setIndex((current) => (current === imgs.length - 1 ? 0 : current + 1));

  return (
    <div className={styles.gallery}>
      <div className={styles.main}>
        <Image
          src={imgs[index]}
          alt={`Imagen ${index + 1}`}
          fill
          className={styles.mainImage}
          sizes="(max-width: 720px) 100vw, 640px"
          loading="eager"
        />

        {imgs.length > 1 && (
          <>
            <button type="button" className={styles.navButton} onClick={prev} aria-label="Imagen anterior">
              ‹
            </button>
            <button type="button" className={`${styles.navButton} ${styles.nextButton}`} onClick={next} aria-label="Imagen siguiente">
              ›
            </button>
          </>
        )}
      </div>

      {imgs.length > 1 && (
        <>
          <div className={styles.counter}>
            Imagen {index + 1} de {imgs.length}
          </div>

          <div className={styles.thumbs}>
            {imgs.map((src, i) => (
              <button
                key={i}
                className={`${styles.thumb} ${i === index ? styles.active : ""}`}
                onClick={() => setIndex(i)}
                aria-label={`Ver imagen ${i + 1}`}
                type="button"
              >
                <Image
                  src={src}
                  alt={`Miniatura ${i + 1}`}
                  width={120}
                  height={80}
                  className={styles.thumbImg}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
