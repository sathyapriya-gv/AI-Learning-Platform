import React from 'react';

const GlassCard = ({ children, className = '', hoverable = false, ...props }) => {
  const baseClass = hoverable ? 'glass-panel-interactive' : 'glass-panel';
  return (
    <div className={`${baseClass} p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default GlassCard;
