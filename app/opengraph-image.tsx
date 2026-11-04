import { ImageResponse } from 'next/og'

// Brand V1.0: dark ink + lime, no stock photos or invented case studies.
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'VEYFRONT — Building Digital Frontiers for Global Business'

export default function Image() {
  return new ImageResponse(
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', backgroundColor: '#17262D', padding: 80,
      color: '#F7F7F2', fontFamily: 'sans-serif',
    }}>
      <div style={{display:'flex', alignItems:'center', gap:18}}>
        <div style={{width: 18, height: 60, backgroundColor:'#B8F06B', borderRadius: 4}} />
        <div style={{fontSize: 74, fontWeight: 700, letterSpacing: 4}}>VEYFRONT</div>
      </div>
      <div style={{height: 3, width: 970, backgroundColor: '#B8F06B', opacity: 0.9, marginTop: 34}} />
      <div style={{fontSize: 49, fontWeight: 600, maxWidth: 980, lineHeight: 1.18, marginTop: 42}}>
        Building Digital Frontiers<br/>for Global Business
      </div>
      <div style={{fontSize: 24, color:'#B8F06B', marginTop: 36}}>LAUNCH  /  REBUILD  /  RUN</div>
    </div>,
    { ...size },
  )
}
