'use client';

import { useEffect, useState } from 'react';

const STATUS_MESSAGES = [
  'Initializing calculation engine...',
  'Loading feed chemistry module...',
  'Calibrating membrane parameters...',
  'Resolving ion balance...',
  'Computing hydraulic gradients...',
  'Validating system constraints...',
];

function PFDSchematic() {
  return (
    <svg
      viewBox="0 0 520 185"
      width="520"
      className="max-w-[92vw]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* ── FEED LABEL ── */}
      <text
        x="8"
        y="73"
        fontSize="6.5"
        fontFamily="'JetBrains Mono', monospace"
        style={{ fill: 'hsl(var(--feed))' }}
        fontWeight="500"
        letterSpacing="0.08em"
      >
        FEED
      </text>

      {/* ── FEED LINE (solid) ── */}
      <line
        x1="8"
        y1="82"
        x2="86"
        y2="82"
        strokeWidth="2"
        style={{ stroke: 'hsl(var(--feed))' }}
      />

      {/* ── HP PUMP ── */}
      <circle
        cx="99"
        cy="82"
        r="13"
        strokeWidth="1.5"
        style={{ stroke: 'hsl(var(--primary))' }}
      />
      {/* Pump impeller (right-facing triangle) */}
      <path
        d="M95 78 L104 82 L95 86"
        strokeWidth="1.5"
        strokeLinejoin="round"
        style={{ stroke: 'hsl(var(--primary))' }}
      />
      {/* Pump tag */}
      <text
        x="99"
        y="105"
        fontSize="5.5"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        style={{ fill: 'hsl(var(--muted-foreground))' }}
        letterSpacing="0.04em"
      >
        P-101
      </text>

      {/* ── LINE: PUMP → PI GAUGE ── */}
      <line
        x1="112"
        y1="82"
        x2="152"
        y2="82"
        strokeWidth="2"
        style={{ stroke: 'hsl(var(--feed))' }}
      />

      {/* ── PI GAUGE (circle with crosshairs) ── */}
      <circle
        cx="161"
        cy="82"
        r="9"
        strokeWidth="1"
        style={{ stroke: 'hsl(var(--primary))' }}
      />
      <line
        x1="157"
        y1="82"
        x2="165"
        y2="82"
        strokeWidth="0.75"
        style={{ stroke: 'hsl(var(--primary))' }}
      />
      <line
        x1="161"
        y1="78"
        x2="161"
        y2="86"
        strokeWidth="0.75"
        style={{ stroke: 'hsl(var(--primary))' }}
      />
      <text
        x="161"
        y="67"
        fontSize="5.5"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        style={{ fill: 'hsl(var(--muted-foreground))' }}
        letterSpacing="0.04em"
      >
        PI-101
      </text>

      {/* ── LINE: PI GAUGE → MEMBRANE VESSEL ── */}
      <line
        x1="170"
        y1="82"
        x2="184"
        y2="82"
        strokeWidth="2"
        style={{ stroke: 'hsl(var(--feed))' }}
      />

      {/* ── MEMBRANE VESSEL ── */}
      <rect
        x="184"
        y="54"
        width="168"
        height="56"
        rx="3"
        strokeWidth="1.5"
        style={{
          stroke: 'hsl(var(--foreground) / 0.5)',
          fill: 'hsl(var(--muted))',
        }}
        className="pulse-soft"
      />
      {/* Internal membrane element dividers */}
      {[206, 224, 242, 260, 278, 296, 314, 332].map((x) => (
        <line
          key={x}
          x1={x}
          y1="58"
          x2={x}
          y2="106"
          strokeWidth="0.75"
          strokeDasharray="2 2"
          style={{ stroke: 'hsl(var(--muted-foreground) / 0.5)' }}
        />
      ))}
      {/* RO-101 label above vessel */}
      <text
        x="268"
        y="48"
        fontSize="7"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        style={{ fill: 'hsl(var(--foreground))' }}
        fontWeight="600"
        letterSpacing="0.06em"
      >
        RO-101
      </text>

      {/* ── REJECT LINE (orange/concentrate dashed, animated) ── */}
      <line
        x1="352"
        y1="82"
        x2="480"
        y2="82"
        strokeWidth="2"
        strokeDasharray="7 5"
        className="flow-line"
        style={{
          stroke: 'hsl(var(--concentrate))',
          animationDuration: '0.9s',
        }}
      />
      {/* Reject label */}
      <text
        x="483"
        y="76"
        fontSize="6.5"
        fontFamily="'JetBrains Mono', monospace"
        style={{ fill: 'hsl(var(--concentrate))' }}
        fontWeight="500"
        letterSpacing="0.08em"
      >
        REJECT
      </text>
      {/* CV-101 tag below reject line */}
      <text
        x="415"
        y="98"
        fontSize="5.5"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        style={{ fill: 'hsl(var(--muted-foreground))' }}
        letterSpacing="0.04em"
      >
        CV-101
      </text>

      {/* ── PERMEATE: vertical drop ── */}
      <line
        x1="268"
        y1="110"
        x2="268"
        y2="160"
        strokeWidth="2"
        strokeDasharray="7 5"
        className="flow-line"
        style={{
          stroke: 'hsl(var(--permeate))',
          animationDuration: '1.4s',
        }}
      />
      {/* PERMEATE: horizontal run */}
      <line
        x1="268"
        y1="160"
        x2="430"
        y2="160"
        strokeWidth="2"
        strokeDasharray="7 5"
        className="flow-line"
        style={{
          stroke: 'hsl(var(--permeate))',
          animationDuration: '1.4s',
        }}
      />
      {/* COND sensor (square instrument box) */}
      <rect
        x="420"
        y="151"
        width="18"
        height="18"
        rx="1.5"
        strokeWidth="1"
        style={{
          stroke: 'hsl(var(--permeate))',
          fill: 'hsl(var(--permeate-soft))',
        }}
      />
      <line
        x1="420"
        y1="160"
        x2="438"
        y2="160"
        strokeWidth="0.6"
        style={{ stroke: 'hsl(var(--permeate))' }}
      />
      <line
        x1="429"
        y1="151"
        x2="429"
        y2="169"
        strokeWidth="0.6"
        style={{ stroke: 'hsl(var(--permeate))' }}
      />
      <text
        x="429"
        y="142"
        fontSize="5.5"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        style={{ fill: 'hsl(var(--permeate))' }}
        letterSpacing="0.04em"
      >
        COND-201
      </text>
      {/* PERMEATE label */}
      <text
        x="449"
        y="164"
        fontSize="6.5"
        fontFamily="'JetBrains Mono', monospace"
        style={{ fill: 'hsl(var(--permeate))' }}
        fontWeight="500"
        letterSpacing="0.08em"
      >
        PERMEATE
      </text>

      {/* ── FLOW DIRECTION ARROW on feed line ── */}
      <path
        d="M78 78 L86 82 L78 86"
        strokeWidth="1.5"
        strokeLinejoin="round"
        style={{ stroke: 'hsl(var(--feed))' }}
      />
    </svg>
  );
}

export function ROLoader() {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background dot-bg gap-10">
      {/* Wordmark */}
      <div className="flex flex-col items-center gap-1.5">
        <span
          className="font-mono text-[10px] tracking-[0.36em] text-muted-foreground uppercase"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          TRANSFILM
        </span>
        <span
          className="text-[11px] text-muted-foreground/50 tracking-[0.18em] uppercase"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          RO Design Studio
        </span>
      </div>

      {/* PFD Schematic */}
      <PFDSchematic />

      {/* Status row */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full pulse-soft"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          />
          <span
            className="text-[11px] text-muted-foreground"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {STATUS_MESSAGES[statusIndex]}
          </span>
        </div>

        {/* Indeterminate progress bar */}
        <div
          className="relative h-[2px] w-48 rounded-full overflow-hidden"
          style={{ backgroundColor: 'hsl(var(--border))' }}
        >
          <div
            className="absolute inset-y-0 w-16 rounded-full loader-bar"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          />
        </div>
      </div>
    </div>
  );
}
