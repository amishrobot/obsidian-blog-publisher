import { h } from 'preact';

interface CheckBadgeProps {
  label: string;
  passed: boolean;
  running: boolean;
  justPassed: boolean;
}

export function CheckBadge({ label, passed, running, justPassed }: CheckBadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 8px', borderRadius: 4, fontSize: 11,
        background: running ? '#e5c07b15' : passed ? '#98c37915' : '#e06c7515',
        color: running ? '#e5c07b' : passed ? '#98c379' : '#e06c75',
        border: `1px solid ${running ? '#e5c07b30' : passed ? '#98c37930' : '#e06c7530'}`,
        transition: 'all 0.3s ease',
        animation: justPassed ? 'checkPop 0.3s ease' : 'none',
      }}
    >
      <span style={{
        fontSize: 10,
        display: 'inline-block',
        animation: running ? 'spin 1s linear infinite' : 'none',
      }}>
        {running ? '\u27F3' : passed ? '\u2713' : '\u2717'}
      </span>
      {label}
    </span>
  );
}
