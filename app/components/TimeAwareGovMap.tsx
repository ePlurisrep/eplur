"use client"

import { useState, useEffect } from 'react'
import GovernmentTree from './GovernmentTree'
import TimeSlider from '@/components/TimeSlider'
import { filterByYear } from '@/lib/timeFilter'
import type { GovernmentNode } from '@/types/government'

export function TimeAwareGovMap({ nodes }: { nodes: GovernmentNode[] }) {
  const [year, setYear] = useState(new Date().getFullYear())
  const [filtered, setFiltered] = useState<GovernmentNode[]>(nodes)

  useEffect(() => {
    setFiltered(filterByYear(nodes, year))
  }, [year, nodes])

  return (
    <>
      <TimeSlider year={year} setYear={setYear} />
      <GovernmentTree nodes={filtered} />
    </>
  )
}

export default TimeAwareGovMap
