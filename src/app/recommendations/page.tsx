import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MatchStatusButton } from './match-status-button'
import type { MatchWithJob } from '@/lib/supabase'

export const metadata = {
  title: '추천 일자리 목록 | 상상우리',
}

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score === 6
      ? 'bg-yellow-500 text-white'
      : score >= 4
        ? 'bg-green-600 text-white'
        : 'bg-gray-400 text-white'
  const label =
    score === 6 ? '매우 적합' : score >= 4 ? '적합' : '보통'
  return (
    <div className="flex items-center gap-2">
      <Badge className={`text-lg px-3 py-1 ${cls}`}>{score}점</Badge>
      <span className="text-base font-medium text-gray-600">{label}</span>
    </div>
  )
}

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams: Promise<{ senior_id?: string }>
}) {
  const { senior_id } = await searchParams

  if (!senior_id) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">자동 매칭 추천 목록</h1>
        <div className="rounded-lg border-2 border-blue-300 bg-blue-50 px-6 py-5 text-lg text-blue-800">
          URL에 <code className="font-mono font-bold">?senior_id=...</code> 파라미터를 전달하면
          해당 시니어의 매칭 결과를 확인할 수 있습니다.
        </div>
      </div>
    )
  }

  const [{ data: senior }, { data: matchesRaw }] = await Promise.all([
    supabase.from('seniors').select('*').eq('id', senior_id).single(),
    supabase
      .from('matches')
      .select('*, jobs(*)')
      .eq('senior_id', senior_id)
      .gt('score', 0)
      .order('score', { ascending: false }),
  ])

  if (!senior) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">자동 매칭 추천 목록</h1>
        <div className="rounded-lg border-2 border-red-300 bg-red-50 px-6 py-5 text-lg text-red-800">
          해당 시니어 정보를 찾을 수 없습니다.
        </div>
      </div>
    )
  }

  const matches = (matchesRaw ?? []) as MatchWithJob[]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">{senior.name}님께 맞는 일자리</h1>
        <p className="text-xl text-gray-600">
          {senior.region} · {senior.desired_job} — 점수 높은 순
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="rounded-lg border-2 border-gray-300 bg-gray-50 px-6 py-8 text-center space-y-2">
          <p className="text-xl font-semibold text-gray-700">현재 매칭되는 일자리가 없습니다.</p>
          <p className="text-lg text-gray-500">담당자가 직접 연락드리니 잠시만 기다려 주세요.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match, idx) => (
            <Card key={match.id} className="border-2 transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    <span className="mr-2 text-gray-400">#{idx + 1}</span>
                    {match.jobs.title}
                  </CardTitle>
                  <ScoreBadge score={match.score} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6 text-lg text-gray-700">
                  <span>
                    <span className="font-semibold">지역:</span> {match.jobs.region}
                  </span>
                  <span>
                    <span className="font-semibold">직종:</span> {match.jobs.job_type}
                  </span>
                  <span>
                    <span className="font-semibold">요구 경력:</span>{' '}
                    {match.jobs.required_career > 0
                      ? `${match.jobs.required_career}년 이상`
                      : '무관'}
                  </span>
                </div>
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <MatchStatusButton matchId={match.id} status={match.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
