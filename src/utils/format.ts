export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatSeconds(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const whole = Math.floor(sec);
  const minutes = Math.floor(whole / 60);
  const seconds = whole % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatTotalDuration(durationsMs: number[]): string {
  const totalMs = durationsMs.reduce((sum, val) => sum + (Number.isFinite(val) ? val : 0), 0);
  const totalMins = Math.round(totalMs / 60000);
  if (totalMins < 60) {
    return `${totalMins} min`;
  }
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
}
