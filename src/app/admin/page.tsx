import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { JobManagementSection } from './job-section'

export const metadata = {
  title: '담당자 대시보드 | 상상우리',
}

const statusGroups = [
  {
    label: '미매칭',
    color: 'bg-red-100 border-red-300',
    badgeClass: 'bg-red-500 text-white',
    count: 12,
    items: ['홍길동 (서울)', '김순자 (부산)', '이민호 (대구)'],
  },
  {
    label: '매칭 대기',
    color: 'bg-yellow-100 border-yellow-300',
    badgeClass: 'bg-yellow-500 text-white',
    count: 7,
    items: ['박영수 (인천)', '최정희 (광주)'],
  },
  {
    label: '배정 완료',
    color: 'bg-green-100 border-green-300',
    badgeClass: 'bg-green-600 text-white',
    count: 24,
    items: ['강민준 (울산)', '윤서연 (수원)', '임철수 (성남)'],
  },
]

export default async function AdminPage() {
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-10">
      {/* 매칭 현황 */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">담당자 대시보드</h1>
          <p className="text-lg text-gray-500">
            매칭 현황을 한눈에 확인하고 관리하세요. 아래는 예시 데이터입니다.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {statusGroups.map((group) => (
            <Card key={group.label} className={`border-2 ${group.color}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{group.label}</CardTitle>
                  <Badge className={`text-lg px-3 py-1 ${group.badgeClass}`}>
                    {group.count}건
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-base text-gray-700">
                  {group.items.map((name) => (
                    <li key={name} className="flex items-center gap-2">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-500" />
                      {name}
                    </li>
                  ))}
                  <li className="mt-1 text-sm text-gray-400">
                    외 {group.count - group.items.length}명…
                  </li>
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 일자리 관리 */}
      <section>
        <JobManagementSection initialJobs={jobs ?? []} />
      </section>
    </div>
  )
}
