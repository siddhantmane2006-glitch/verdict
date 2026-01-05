import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'transparent',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        {/* The Orange Background (Skewed & Rotated) */}
        <div
          style={{
            position: 'absolute',
            background: '#F04E23', // Your Brand Orange
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            // Replicating your CSS: transform -skew-x-12 -rotate-2
            transform: 'skew(-12deg) rotate(-2deg)',
          }}
        />
        
        {/* The "V" Text */}
        <div
          style={{
            position: 'relative',
            fontFamily: 'sans-serif',
            fontWeight: 900,
            marginTop: '-2px', // Slight optical adjustment
            zIndex: 10,
          }}
        >
          V
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}