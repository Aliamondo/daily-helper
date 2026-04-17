import { useState } from 'react'

type PageCursor = {
  startCursor?: string
  endCursor?: string
  page: PageNavigation
  total?: number
}

const initialPageCursor: PageCursor = { page: 'NEXT_PAGE' }

export function usePagination() {
  const [pageCursor, setPageCursor] = useState<PageCursor>(initialPageCursor)

  const reset = () => setPageCursor(initialPageCursor)

  const navigate = (
    page: PageNavigation,
    pageable?: Pick<Pageable, 'startCursor' | 'endCursor' | 'total'>,
  ) =>
    setPageCursor({
      startCursor: pageable?.startCursor,
      endCursor: pageable?.endCursor,
      page,
      total: pageable?.total,
    })

  return { pageCursor, reset, navigate }
}

export type { PageCursor }
