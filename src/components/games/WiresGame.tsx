import { useRef, useState, type KeyboardEvent } from 'react'
import { RotateCcw } from 'lucide-react'
import { shuffle } from '../../lib/random'

type Shape = 'circle' | 'triangle' | 'square' | 'diamond'
type Wire = { id: string; label: string; color: string; shape: Shape }

// Each wire has its own colour AND shape, so the puzzle never depends on colour vision alone.
const WIRES: Wire[] = [
  { id: 'red', label: 'Red circle', color: '#F45858', shape: 'circle' },
  { id: 'blue', label: 'Blue triangle', color: '#67C9F5', shape: 'triangle' },
  { id: 'yellow', label: 'Yellow square', color: '#FFD166', shape: 'square' },
  { id: 'violet', label: 'Violet diamond', color: '#B8A5F5', shape: 'diamond' },
]

type Side = 'left' | 'right'
const LEFT_X = 52
const RIGHT_X = 368
const rowY = (i: number) => 48 + i * 68

function makeLayout() {
  const left = shuffle(WIRES)
  let right = shuffle(WIRES)
  // Never hand over a puzzle that is already solved straight across.
  while (right.every((w, i) => w.id === left[i].id)) right = shuffle(WIRES)
  return { left, right }
}

function Glyph({ shape, x, y, color }: { shape: Shape; x: number; y: number; color: string }) {
  const common = { fill: color, stroke: '#070A1A', strokeWidth: 4, strokeLinejoin: 'round' as const }
  switch (shape) {
    case 'circle':
      return <circle cx={x} cy={y} r={17} {...common} />
    case 'square':
      return <rect x={x - 16} y={y - 16} width={32} height={32} rx={5} {...common} />
    case 'triangle':
      return <polygon points={`${x},${y - 19} ${x + 19},${y + 15} ${x - 19},${y + 15}`} {...common} />
    case 'diamond':
      return <polygon points={`${x},${y - 20} ${x + 20},${y} ${x},${y + 20} ${x - 20},${y}`} {...common} />
  }
}

type Props = { onComplete: () => void }

/**
 * Connect-the-wires task. Pick a connector on one side, then its twin on the other.
 * Connectors are real focusable buttons: Tab to move, Enter or Space to pick.
 */
export function WiresGame({ onComplete }: Props) {
  const [layout, setLayout] = useState(makeLayout)
  const [done, setDone] = useState<string[]>([])
  const [picked, setPicked] = useState<{ side: Side; id: string } | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [shaking, setShaking] = useState<string | null>(null)
  const [message, setMessage] = useState('Match each connector on the left to its twin on the right.')
  const [seconds, setSeconds] = useState<number | null>(null)
  const startedAt = useRef<number | null>(null)

  const finished = done.length === WIRES.length

  const choose = (side: Side, id: string) => {
    if (finished || done.includes(id)) return
    if (startedAt.current === null) startedAt.current = Date.now()

    if (!picked || picked.side === side) {
      setPicked({ side, id })
      setMessage('Now pick the matching connector on the other side.')
      return
    }

    if (picked.id === id) {
      const next = [...done, id]
      setDone(next)
      setPicked(null)
      if (next.length === WIRES.length) {
        setSeconds(Math.max(1, Math.round((Date.now() - (startedAt.current ?? Date.now())) / 1000)))
        setMessage('All wires connected. Power restored.')
        onComplete()
      } else {
        setMessage(`Connected. ${WIRES.length - next.length} to go.`)
      }
    } else {
      setMistakes((m) => m + 1)
      setShaking(`${side}-${id}`)
      setPicked(null)
      setMessage('Those two do not match. Check the colour and the shape, then try again.')
    }
  }

  const reset = () => {
    setLayout(makeLayout())
    setDone([])
    setPicked(null)
    setMistakes(0)
    setShaking(null)
    setSeconds(null)
    setMessage('Match each connector on the left to its twin on the right.')
    startedAt.current = null
  }

  const onKey = (e: KeyboardEvent<SVGGElement>, side: Side, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      choose(side, id)
    }
  }

  const renderNode = (side: Side, wire: Wire, row: number) => {
    const x = side === 'left' ? LEFT_X : RIGHT_X
    const y = rowY(row)
    const connected = done.includes(wire.id)
    const isPicked = picked?.side === side && picked.id === wire.id
    const key = `${side}-${wire.id}`
    return (
      <g
        key={key}
        role="button"
        tabIndex={connected || finished ? -1 : 0}
        aria-label={`${side === 'left' ? 'Left' : 'Right'} ${wire.label} connector${connected ? ', connected' : ''}`}
        aria-pressed={isPicked}
        aria-disabled={connected || finished}
        className={`node ${shaking === key ? 'shake' : ''}`}
        onClick={() => choose(side, wire.id)}
        onKeyDown={(e) => onKey(e, side, wire.id)}
        onAnimationEnd={() => shaking === key && setShaking(null)}
      >
        <circle cx={x} cy={y} r={30} fill="transparent" />
        <circle className="node-ring" cx={x} cy={y} r={29} fill="none" stroke="#FFD166" strokeWidth="3" strokeDasharray="5 5" />
        <g className="node-body" opacity={connected ? 0.95 : 1}>
          <Glyph shape={wire.shape} x={x} y={y} color={wire.color} />
        </g>
      </g>
    )
  }

  return (
    <div>
      <div className="panel p-4 sm:p-6">
        <svg viewBox="0 0 420 300" className="mx-auto h-auto w-full max-w-lg" role="group" aria-label="Wiring panel">
          <rect x="6" y="6" width="408" height="288" rx="22" fill="#0B1330" stroke="#2A3270" strokeWidth="3" />
          {/* panel screws */}
          {[[20, 20], [400, 20], [20, 280], [400, 280]].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" fill="#2A3270" />
          ))}
          {/* the cable run behind the nodes */}
          <path d={`M${LEFT_X + 30} 24 H${RIGHT_X - 30}`} stroke="#141A40" strokeWidth="6" strokeLinecap="round" />

          {/* connected wires */}
          {done.map((id) => {
            const wire = WIRES.find((w) => w.id === id)!
            const li = layout.left.findIndex((w) => w.id === id)
            const ri = layout.right.findIndex((w) => w.id === id)
            const y1 = rowY(li)
            const y2 = rowY(ri)
            const d = `M${LEFT_X + 20} ${y1} C 190 ${y1}, 230 ${y2}, ${RIGHT_X - 20} ${y2}`
            return (
              <g key={id} fill="none" strokeLinecap="round">
                <path d={d} stroke="#070A1A" strokeWidth="13" />
                <path className="wire-in" d={d} stroke={wire.color} strokeWidth="7" />
              </g>
            )
          })}

          {layout.left.map((w, i) => renderNode('left', w, i))}
          {layout.right.map((w, i) => renderNode('right', w, i))}
        </svg>
      </div>

      <p role="status" className="mt-5 min-h-[3.25rem] text-lg text-mute">
        {message}
      </p>

      {finished && seconds !== null && (
        <p className="mb-2 rounded-2xl border-2 border-lime bg-panel p-4 text-cream">
          <strong className="font-display">Wiring fixed</strong> in {seconds} {seconds === 1 ? 'second' : 'seconds'}{' '}
          {mistakes === 0 ? 'with no mismatches.' : `with ${mistakes} ${mistakes === 1 ? 'mismatch' : 'mismatches'}.`}
        </p>
      )}

      <button type="button" onClick={reset} className="btn btn-ghost mt-3">
        <RotateCcw size={18} aria-hidden="true" /> {finished ? 'Rewire (new layout)' : 'Shuffle the panel'}
      </button>
    </div>
  )
}
