import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Verdict - The Logic Arena';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#050505',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ color: '#F04E23', fontSize: 130, fontWeight: 900, lineHeight: 0.8, letterSpacing: '-5px', display: 'flex' }}>
          VERDICT
        </div>
        <div style={{ color: 'white', fontSize: 40, marginTop: 20, letterSpacing: '5px', textTransform: 'uppercase' }}>
          The Logic Arena
        </div>
        <div style={{ 
          marginTop: 40, 
          padding: '10px 30px', 
          background: 'white', 
          color: 'black', 
          fontSize: 24, 
          borderRadius: 50,
          fontWeight: 'bold'
        }}>
          PASS THE TEST TO ENTER
        </div>
      </div>
    ),
    { ...size }
  );
}