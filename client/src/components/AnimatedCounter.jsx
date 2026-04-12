import { useState, useEffect, useRef } from 'react'

export default function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    const numericEnd = parseFloat(end)
    if (isNaN(numericEnd)) { setCount(end); return }

    const isDecimal = end.toString().includes('.')
    const steps = 60
    const increment = numericEnd / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(numericEnd, increment * step)
      setCount(isDecimal ? current.toFixed(1) : Math.floor(current))
      if (step >= steps) clearInterval(timer)
    }, duration / steps)

    return () => clearInterval(timer)
  }, [started, end, duration])

  return <span ref={ref}>{count}{suffix}</span>
}
