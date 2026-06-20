export const Container = ({ children, className = "", fluid = false }) => (
  <div className={`mx-auto px-4 ${fluid ? 'w-full max-w-full' : 'max-w-[1200px]'} ${className}`}>
    {children}
  </div>
);
