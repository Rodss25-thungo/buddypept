import Image from 'next/image';
import { useTranslations } from 'next-intl';

/**
 * Buddy: BuddyPept's helper character, the water droplet with arms, legs and
 * sneakers. Full body in every variant, never cropped.
 *
 * - thumbs: calculator steps and result
 * - hug: landing hero, open arms
 * - mail: pages that ask for or confirm an email, holding an envelope
 *
 * Source art lives in the Drive folder "Buddy Character Bible/Website Buddy".
 * Files in public/buddy are the cutouts at 420px tall, enough for 3x displays
 * at the largest placement (96px).
 */
const VARIANTS = {
  thumbs: { src: '/buddy/buddy-thumbs.webp', width: 354, height: 420 },
  hug: { src: '/buddy/buddy-hug.webp', width: 402, height: 420 },
  mail: { src: '/buddy/buddy-mail.webp', width: 393, height: 420 },
} as const;

export type BuddyVariant = keyof typeof VARIANTS;

export function Buddy({
  className,
  variant = 'thumbs',
}: {
  className?: string;
  variant?: BuddyVariant;
}) {
  const t = useTranslations('a11y');
  const { src, width, height } = VARIANTS[variant];
  return (
    <Image
      src={src}
      width={width}
      height={height}
      alt={t('buddy')}
      className={className}
    />
  );
}
