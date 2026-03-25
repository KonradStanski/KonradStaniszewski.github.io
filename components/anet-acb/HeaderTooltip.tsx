import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface HeaderTooltipProps {
  children: React.ReactNode;
  tooltip: string;
  className?: string;
}

export function Th({ children, tooltip, className = '' }: HeaderTooltipProps) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thRef = useRef<HTMLTableCellElement>(null);

  const updatePos = useCallback(() => {
    if (thRef.current) {
      const rect = thRef.current.getBoundingClientRect();
      setPos({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 4,
      });
    }
  }, []);

  const handleEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    updatePos();
    timeoutRef.current = setTimeout(() => setShow(true), 150);
  }, [updatePos]);

  const handleLeave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(false);
  }, []);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  return (
    <th
      ref={thRef}
      className={`border px-2 py-2 cursor-help ${className}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <span className="border-b border-dotted border-gray-400">{children}</span>
      {show && pos && createPortal(
        <div
          style={{
            position: 'fixed',
            left: pos.x,
            top: pos.y,
            transform: 'translateX(-50%)',
            zIndex: 99999,
          }}
          className="w-60 px-3 py-2 bg-gray-800 text-white text-xs font-normal text-left rounded shadow-lg leading-relaxed whitespace-normal pointer-events-none"
        >
          {tooltip}
          <div
            className="absolute w-2 h-2 bg-gray-800 rotate-45"
            style={{ top: -4, left: '50%', marginLeft: -4 }}
          />
        </div>,
        document.body,
      )}
    </th>
  );
}
