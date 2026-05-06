'use client'

import { useActionState, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { insertSeniorAction, type SeniorFormState } from '@/app/actions'

const REGIONS = ['서울', '경기', '인천', '기타'] as const
const JOBS = ['경비', '청소', '조리', '돌봄', '기타'] as const

const initialState: SeniorFormState = {}

export function RegisterForm() {
  const [state, action, pending] = useActionState(insertSeniorAction, initialState)
  const [region, setRegion] = useState<string | null>(null)
  const [desiredJob, setDesiredJob] = useState<string | null>(null)
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    if (state.success) {
      setRegion(null)
      setDesiredJob(null)
      setFormKey(k => k + 1)
    }
  }, [state])

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-xl">기본 정보</CardTitle>
        <CardDescription className="text-base">
          * 표시는 필수 입력 항목입니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state.success && (
          <div className="mb-6 rounded-lg border-2 border-green-500 bg-green-50 px-5 py-4 text-xl font-semibold text-green-800">
            등록이 완료되었습니다
          </div>
        )}
        {state.errors?.server && (
          <div className="mb-6 rounded-lg border-2 border-red-500 bg-red-50 px-5 py-4 text-lg font-semibold text-red-800">
            {state.errors.server}
          </div>
        )}

        <form key={formKey} action={action} className="space-y-6">
          {/* 이름 */}
          <div className="space-y-2">
            {state.errors?.name && (
              <div className="rounded-lg border border-red-400 bg-red-50 px-4 py-2 text-base font-medium text-red-700">
                {state.errors.name}
              </div>
            )}
            <Label htmlFor="name" className="text-lg font-semibold">
              이름 *
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="홍길동"
              className="h-12 text-lg"
              autoComplete="name"
            />
          </div>

          {/* 지역 */}
          <div className="space-y-2">
            {state.errors?.region && (
              <div className="rounded-lg border border-red-400 bg-red-50 px-4 py-2 text-base font-medium text-red-700">
                {state.errors.region}
              </div>
            )}
            <Label className="text-lg font-semibold">지역 *</Label>
            <Select
              name="region"
              value={region}
              onValueChange={(val) => setRegion(val)}
            >
              <SelectTrigger className="h-12 w-full text-lg">
                <SelectValue placeholder="지역을 선택해 주세요" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((r) => (
                  <SelectItem key={r} value={r} className="py-3 text-lg">
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 희망 직종 */}
          <div className="space-y-2">
            {state.errors?.desired_job && (
              <div className="rounded-lg border border-red-400 bg-red-50 px-4 py-2 text-base font-medium text-red-700">
                {state.errors.desired_job}
              </div>
            )}
            <Label className="text-lg font-semibold">희망 직종 *</Label>
            <Select
              name="desired_job"
              value={desiredJob}
              onValueChange={(val) => setDesiredJob(val)}
            >
              <SelectTrigger className="h-12 w-full text-lg">
                <SelectValue placeholder="직종을 선택해 주세요" />
              </SelectTrigger>
              <SelectContent>
                {JOBS.map((j) => (
                  <SelectItem key={j} value={j} className="py-3 text-lg">
                    {j}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 경력 */}
          <div className="space-y-2">
            <Label htmlFor="career_years" className="text-lg font-semibold">
              경력 (년)
            </Label>
            <Input
              id="career_years"
              name="career_years"
              type="number"
              min={0}
              max={60}
              placeholder="예: 5"
              className="h-12 text-lg"
            />
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="h-14 w-full text-xl"
          >
            {pending ? '등록 중...' : '프로필 등록하기'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
