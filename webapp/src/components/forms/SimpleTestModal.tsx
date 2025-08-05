/**
 * Ultra-simple test modal without Mantine
 */

interface SimpleTestModalProps {
  opened: boolean;
  onClose: () => void;
}

export function SimpleTestModal({ opened, onClose }: SimpleTestModalProps) {
  console.log('🟢 SimpleTestModal render - opened:', opened);
  
  if (!opened) return null;
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          border: '3px solid blue',
          maxWidth: '400px',
          textAlign: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>🎉 MODAL IS WORKING!</h2>
        <p>If you can see this, the modal system works.</p>
        <button 
          onClick={onClose}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'blue',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Close Modal
        </button>
      </div>
    </div>
  );
}