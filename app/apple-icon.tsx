import { ImageResponse } from 'next/og';

/**
 * Apple touch icon (iOS home screen). Generated as a PNG so an installed
 * BuddyPept gets a proper teal icon with the white droplet, not a screenshot.
 */
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0d9488',
        }}
      >
        <svg width="118" height="142" viewBox="0 0 100 120">
          <path
            d="M50 6C68 38 86 60 86 82a36 36 0 0 1-72 0C14 60 32 38 50 6Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
