// Animated fire behind the menu banner: glowing flames along the bottom and sparks floating up.
// Pure CSS (see "Fire banner" in index.css), so it's light and needs no library.
const FLAMES = [
  { left: '-8%', width: '34%', duration: '2.6s', delay: '0s' },
  { left: '18%', width: '26%', duration: '2.1s', delay: '-0.8s' },
  { left: '38%', width: '30%', duration: '2.8s', delay: '-1.6s' },
  { left: '60%', width: '28%', duration: '2.3s', delay: '-0.4s' },
  { left: '80%', width: '34%', duration: '2.5s', delay: '-1.2s' },
]

const SPARKS = [
  [6, 0, 4.2, 18], [14, 1.6, 5.0, -24], [23, 0.7, 3.8, 30], [31, 2.4, 4.6, -16], [42, 1.1, 5.4, 22],
  [50, 3.0, 4.0, -28], [58, 0.3, 4.8, 14], [66, 2.0, 3.6, -20], [74, 1.4, 5.2, 26], [82, 2.8, 4.4, -12],
  [90, 0.9, 3.9, 20], [96, 2.2, 4.7, -26],
] // [left %, delay s, duration s, sideways drift px]

export default function FireBackground() {
  return (
    <div className="fire" aria-hidden="true">
      <div className="fire-glow" />
      {FLAMES.map((f, i) => (
        <span key={i} className="flame" style={{ left: f.left, width: f.width, animationDuration: f.duration, animationDelay: f.delay }} />
      ))}
      {SPARKS.map(([left, delay, duration, drift], i) => (
        <span
          key={i}
          className="spark"
          style={{ left: `${left}%`, animationDelay: `${delay}s`, animationDuration: `${duration}s`, '--drift': `${drift}px` }}
        />
      ))}
    </div>
  )
}
