
import React from 'react';

interface IELogoProps {
  className?: string;
}

export function IELogo({ className }: IELogoProps) {
  return (
    <div className={`relative rounded-full overflow-hidden ${className || ''}`}>
      <img
        src="https://i.im.ge/2025/06/09/vewzUc.Company-Logo-3-1.th.png"
        alt="ieThreadScan Logo"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  );
}
