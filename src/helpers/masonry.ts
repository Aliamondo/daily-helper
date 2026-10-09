/** Rough size in rows, used until a group has been measured */
export function estimateGroupHeight(group: NoteGroup): number {
  return group.notes.reduce((sum, note) => {
    if (note.type === 'todo') return sum + 1 + (note.items?.length ?? 0)
    return sum + 2
  }, 2)
}

/** Places each group in the currently shortest column */
export function distributeIntoColumns(
  groups: NoteGroup[],
  colCount: number,
  heightMap: Record<string, number>,
): NoteGroup[][] {
  const columns: NoteGroup[][] = Array.from({ length: colCount }, () => [])
  const heights: number[] = Array(colCount).fill(0)
  for (const group of groups) {
    const h = heightMap[group.id] ?? estimateGroupHeight(group)
    const shortest = heights.indexOf(Math.min(...heights))
    columns[shortest].push(group)
    heights[shortest] += h
  }
  return columns
}

/** How many columns of at least minWidth fit, never fewer than one */
export function getColumnCount(
  containerWidth: number,
  minWidth: number,
  gap: number,
): number {
  return containerWidth > 0
    ? Math.max(1, Math.floor((containerWidth + gap) / (minWidth + gap)))
    : 1
}
