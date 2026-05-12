export default function Skeleton({ className = '', style = {} }) {
  return (
    <div 
      className={`skeleton ${className}`} 
      style={{
        width: style.width || '100%',
        height: style.height || '20px',
        ...style
      }} 
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 'var(--space-4)', opacity: 0.7 }}>
      <Skeleton style={{ height: '160px', marginBottom: '12px' }} />
      <Skeleton style={{ width: '80%', height: '18px', marginBottom: '8px' }} />
      <Skeleton style={{ width: '40%', height: '14px', marginBottom: '16px' }} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <Skeleton style={{ width: '60px', height: '24px', borderRadius: '12px' }} />
        <Skeleton style={{ width: '60px', height: '24px', borderRadius: '12px' }} />
      </div>
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Skeleton style={{ width: '96px', height: '96px', borderRadius: '50%', marginBottom: '20px' }} />
      <Skeleton style={{ width: '200px', height: '28px', marginBottom: '12px' }} />
      <Skeleton style={{ width: '150px', height: '18px', marginBottom: '32px' }} />
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Skeleton style={{ height: '120px' }} />
        <Skeleton style={{ height: '120px' }} />
      </div>
    </div>
  );
}
