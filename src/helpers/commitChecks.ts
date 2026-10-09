export function getCommitChecksCalculatedStatus(
  result: CommitCheck['result'],
  commitChecks: CommitCheck[],
): CommitCheck['result'] {
  if (result === 'SUCCESS') {
    if (commitChecks.find(commitCheck => commitCheck.result === 'PENDING')) {
      return 'FAILURE'
    }
  }

  return result
}

export function getCommitChecksCompositeStatus(
  resultRaw: CommitCheck['result'],
  commitChecks: CommitCheck[],
): string {
  const result = getCommitChecksCalculatedStatus(resultRaw, commitChecks)

  switch (result) {
    case 'SUCCESS':
      return 'All checks have passed'
    case 'IN_PROGRESS':
    case 'PENDING':
      return "Some checks haven't completed yet"
    case 'SKIPPED':
      return 'All checks were skipped'
    default:
      return 'Some checks were not successful'
  }
}

/** Skipped checks count as passed */
export function countPassedChecks(commitChecks: CommitCheck[]): number {
  return commitChecks.filter(
    ({ result }) => result === 'SUCCESS' || result === 'SKIPPED',
  ).length
}
