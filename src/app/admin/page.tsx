import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { JobManagementSection } from './job-section'
import type { SeniorWithMatches } from '@/lib/supabase'

export const metadata = {
  title: '담당자 대시보드 | 상상우리',
}

// 시니어 1명의 파생 상태를 계산
function derivedStatus(
  matches: SeniorWithMatches['matches'],
): 'unmatched' | 'pending' | 'assigned' {
  if (!matches || matches.length === 0) return 'unmatched'
  if (matches.some(m => m.status === 'assigned' || m.status === 'done')) return 'assigned'
  if (matches.some(m => m.score > 0)) return 'pending'
  return 'unmatched'
}

function maxScore(matches: SeniorWithMatches['matches']): number {
  if (!matches || matches.length === 0) return 0
  return Math.max(0, ...matches.map(m => m.score))
}

const STATUS_LABEL: Record<string, string> = {
  unmatched: '미매칭',
  pending: '매칭 대기',
  assigned: '배정 완료',
}

const STATUS_BADGE: Record<string, string> = {
  unmatched: 'bg-red-500 text-white',
  pending: 'bg-yellow-500 text-white',
  assigned: 'bg-green-600 text-white',
}

export default async function AdminPage() {
  const [{ data: seniorsRaw }, { data: jobsRaw }] = await Promise.all([
    supabase
      .from('seniors')
      .select('*, matches(score, status)')
      .order('created_at', { ascending: false }),
    supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false }),
  ])

  const seniors = (seniorsRaw ?? []) as SeniorWithMatches[]
  const jobs = jobsRaw ?? []

  const unmatchedCount = seniors.filter(s => derivedStatus(s.matches) === 'unmatched').length
  const pendingCount = seniors.filter(s => derivedStatus(s.matches) === 'pending').length
  const assignedCount = seniors.filter(s => derivedStatus(s.matches) === 'assigned').length

  const summaryCards = [
    {
      label: '미매칭',
      count: unmatchedCount,
      color: 'bg-red-100 border-red-300',
      badgeClass: 'bg-red-500 text-white',
      desc: '매칭 점수가 없는 시니어',
    },
    {
      label: '매칭 대기',
      count: pendingCount,
      color: 'bg-yellow-100 border-yellow-300',
      badgeClass: 'bg-yellow-500 text-white',
      desc: '매칭 점수 있음, 배정 전',
    },
    {
      label: '배정 완료',
      count: assignedCount,
      color: 'bg-green-100 border-green-300',
      badgeClass: 'bg-green-600 text-white',
      desc: '배정 또는 완료 처리됨',
    },
  ]

  return (
    <div className="space-y-10">
      {/* ── 매칭 현황 집계 ─────────────────────────────── */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">담당자 대시보드</h1>
          <p className="text-lg text-gray-500">
            등록 시니어 <strong>{seniors.length}명</strong> · 일자리{' '}
            <strong>{jobs.length}건</strong>
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {summaryCards.map(card => (
            <Card key={card.label} className={`border-2 ${card.color}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{card.label}</CardTitle>
                  <Badge className={`text-lg px-3 py-1 ${card.badgeClass}`}>
                    {card.count}명
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-base text-gray-600">{card.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── 시니어 목록 테이블 ─────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-gray-900">시니어 목록</h2>
        <Card className="border-2">
          <CardContent className="p-0">
            {seniors.length === 0 ? (
              <p className="py-10 text-center text-lg text-gray-400">
                등록된 시니어가 없습니다.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-base">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50 text-left">
                      <th className="px-4 py-3 font-semibold text-gray-700">이름</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">지역</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">희망 직종</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">최고 점수</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">상태</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">상세</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seniors.map(senior => {
                      const status = derivedStatus(senior.matches)
                      const best = maxScore(senior.matches)
                      return (
                        <tr
                          key={senior.id}
                          className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 font-medium text-gray-900">{senior.name}</td>
                          <td className="px-4 py-3 text-gray-700">{senior.region}</td>
                          <td className="px-4 py-3 text-gray-700">{senior.desired_job}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`font-bold text-lg ${
                                best === 6
                                  ? 'text-yellow-600'
                                  : best >= 4
                                    ? 'text-green-600'
                                    : best >= 2
                                      ? 'text-gray-500'
                                      : 'text-gray-400'
                              }`}
                            >
                              {best}점
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`text-sm px-2 py-0.5 ${STATUS_BADGE[status]}`}>
                              {STATUS_LABEL[status]}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/recommendations?senior_id=${senior.id}`}
                              className="inline-flex h-9 items-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            >
                              상세 보기
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── 일자리 관리 ────────────────────────────────── */}
      <section>
        <JobManagementSection initialJobs={jobs} />
      </section>
    </div>
  )
}
