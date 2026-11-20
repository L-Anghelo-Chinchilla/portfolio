// Simple image carousel: images stacked on top of each other, cross-fading in and out.
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const Frame = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 6px;
  overflow: hidden;
  background: #111;
`

const Slide = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: ${(p) => (p.$active ? 1 : 0)};
  transition: opacity 1s ease-in-out;
`

const FadeCarousel = ({ images, interval = 3500 }) => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (images.length < 2) return undefined;
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), interval);
    return () => clearInterval(t);
  }, [images.length, interval]);

  return (
    <Frame>
      {images.map((src, i) => (
        <Slide key={src} src={src} alt="" $active={i === idx} draggable={false} />
      ))}
    </Frame>
  );
}

export default FadeCarousel;
