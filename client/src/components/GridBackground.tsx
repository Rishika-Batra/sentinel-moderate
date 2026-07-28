
export const GridBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      <div 
        className="absolute inset-[-24px] w-[calc(100%+48px)] h-[calc(100%+48px)] animate-grid-drift"
        style={{
          backgroundImage: 'radial-gradient(circle at center, #1A2036 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  );
};
