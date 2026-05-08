'use client'

import { useTransition } from 'react'
import { updateMatchStatusAction, type MatchStatus } from '@/app/actions'

const NEXT: Record<MatchStatus, MatchStatus | null> = {
  pending: 'assigned',
  assigned: 'done',
  done: null,
}

const LABEL: Record<MatchStatus, string> = {
  pending: '배정',
  assigned: '완료 처리',
  done: '처리 완료',
}

const CLS: Record<MatchStatus, string> = {
  pending: 'bg-blue-600 hover:bg-blue-700 text-white',
  assigned: 'bg-green-600 hover:bg-green-700 text-white',
  done: 'bg-gray-300 text-gray-500 cursor-default',
}

const STATUS_BADGE: Record<MatchStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  assigned: 'bg-blue-100 text-blue-800 border border-blue-300',
  done: 'bg-green-100 text-green-800 border border-green-300',
}

const STATUS_LABEL: Record<MatchStatus, string> = {
  pending: '대기',
  assigned: '배정',
  done: '완료',
}

export function MatchStatusButton({
  matchId,
  status,
}: {
  matchId: string
  status: MatchStatus
}) {
  const [isPending, startTransition] = useTransition()
  const next = NEXT[status]

  const handleClick = () => {
    if (!next) return
    startTransition(async () => {
      await updateMatchStatusAction(matchId, next)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`rounded-full px-2.5 py-0.5 text-sm font-medium ${STATUS_BADGE[status]}`}>
        {STATUS_LABEL[status]}
      </span>
      <button
        onClick={handleClick}
        disabled={!next || isPending}
        className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${CLS[status]}`}
      >
        {isPending ? '처리 중...' : LABEL[status]}
      </button>
    </div>
  )
}
