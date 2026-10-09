import { describe, expect, it } from 'vitest'
import {
  countPassedChecks,
  getCommitChecksCalculatedStatus,
  getCommitChecksCompositeStatus,
} from './commitChecks'

const check = (result: CommitCheck['result']) => ({ result }) as CommitCheck

describe('commit check status', () => {
  it('keeps the rollup result when nothing is pending', () => {
    expect(getCommitChecksCalculatedStatus('SUCCESS', [check('SUCCESS')])).toBe(
      'SUCCESS',
    )
    expect(getCommitChecksCalculatedStatus('FAILURE', [check('PENDING')])).toBe(
      'FAILURE',
    )
  })

  it('describes the result', () => {
    expect(getCommitChecksCompositeStatus('SUCCESS', [])).toBe(
      'All checks have passed',
    )
    expect(getCommitChecksCompositeStatus('PENDING', [])).toBe(
      "Some checks haven't completed yet",
    )
    expect(getCommitChecksCompositeStatus('SKIPPED', [])).toBe(
      'All checks were skipped',
    )
    expect(getCommitChecksCompositeStatus('FAILURE', [])).toBe(
      'Some checks were not successful',
    )
  })

  it('counts skipped checks as passed', () => {
    expect(
      countPassedChecks([
        check('SUCCESS'),
        check('SKIPPED'),
        check('FAILURE'),
        check('PENDING'),
      ]),
    ).toBe(2)
  })
})
