import { ImageResponse } from 'next/og';

/**
 * Tiny signature logo (32x32 PNG) for use in email signatures.
 *
 * Same design as the apple-icon (teal background, white BuddyPept droplet),
 * rendered at signature-friendly size so Gmail can display it at its native
 * size without awkward resizing.
 *
 * Served from /signature-logo. Long cache because the image rarely changes.
 */

export async function GET() {
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
        <svg width="21" height="25" viewBox="0 0 100 120">
          <path
            d="M50 6C68 38 86 60 86 82a36 36 0 0 1-72 0C14 60 32 38 50 6Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    ),
    {
      width: 32,
      height: 32,
      headers: {
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    }
  );
}
