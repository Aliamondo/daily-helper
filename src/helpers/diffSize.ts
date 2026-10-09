// A one-line change is nearly always +1 -1, so the smallest diff still needs two
// squares - with a single one there is nowhere for the ratio to show
const MIN_SQUARES = 2
const MAX_SQUARES = 10
// Changed-line ceiling per square, give or take doubling at every step. One entry
// per count from MIN_SQUARES upwards, anything past the last one is MAX_SQUARES
const SQUARE_THRESHOLDS = [2, 10, 25, 50, 100, 250, 500, 1000]

/**
 * How many squares the row is long. Length is what makes the size of a diff
 * readable at a glance, so it carries the magnitude - the green/red split within
 * that length carries the additions/deletions ratio
 */
export function getSquareCount(additions: number, deletions: number): number {
  const changedLines = additions + deletions
  if (changedLines === 0) return 0

  const step = SQUARE_THRESHOLDS.findIndex(
    threshold => changedLines <= threshold,
  )
  return step === -1 ? MAX_SQUARES : MIN_SQUARES + step
}

export function getDiffSizeSquares(
  additions: number,
  deletions: number,
): { additionSquares: number; deletionSquares: number } {
  const changedLines = additions + deletions
  const squareCount = getSquareCount(additions, deletions)
  if (squareCount === 0) return { additionSquares: 0, deletionSquares: 0 }

  let additionSquares = Math.round((additions / changedLines) * squareCount)

  // Never round a side that has lines in it away completely
  if (additionSquares === 0 && additions > 0) additionSquares = 1
  if (additionSquares === squareCount && deletions > 0)
    additionSquares = squareCount - 1

  return { additionSquares, deletionSquares: squareCount - additionSquares }
}
