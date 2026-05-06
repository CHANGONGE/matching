'use client'

import { useActionState, useState, useEffect, useRef, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { insertJobAction, deleteJobAction, type JobFormState } from '@/app/actions'
import type { Job } from '@/lib/supabase'

const REGIONS = ['서울', '경기', '인천', '기타'] as const
const JOB_TYPES = ['경비', '청소', '조리', '돌봄', '기타'] as const

const initialAddState: JobFormState = {}

export function JobManagementSection({ initialJobs }: { initialJobs: Job[] }) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs)
  const [addState, addAction, addPending] = useActionState(insertJobAction, initialAddState)
  const [addRegion, setAddRegion] = useState<string | null>(null)
  const [addJobType, setAddJobType] = useState<string | null>(null)
  const [addFormKey, setAddFormKey] = useState(0)
  const lastAddedIdRef = useRef<string | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()

  useEffect(() => {
    const newJob = addState.newJob
    if (newJob && newJob.id !== lastAddedIdRef.current) {
      lastAddedIdRef.current = newJob.id
      setJobs(prev => [newJob, ...prev])
      setAddRegion(null)
      setAddJobType(null)
      setAddFormKey(k => k + 1)
    }
  }, [addState.newJob])

  const handleDelete = (jobId: string) => {
    startDeleteTransition(async () => {
      const result = await deleteJobAction(jobId)
      if (result.success) {
        setJobs(prev => prev.filter(j => j.id !== jobId))
      }
    })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">일자리 관리</h2>

      {/* 일자리 추가 폼 */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl">일자리 추가</CardTitle>
        </CardHeader>
        <CardContent>
          {addState.error && (
            <div className="mb-4 rounded-lg border border-red-400 bg-red-50 px-4 py-3 text-base font-medium text-red-700">
              {addState.error}
            </div>
          )}
          <form key={addFormKey} action={addAction} className="grid gap-4 sm:grid-cols-2">
            {/* 공고명 */}
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="job-title" className="text-base font-semibold">
                공고명 *
              </Label>
              <Input
                id="job-title"
                name="title"
                placeholder="예: 강남구 아파트 경비원 모집"
                className="h-11 text-base"
              />
            </div>

            {/* 지역 */}
            <div className="space-y-1">
              <Label className="text-base font-semibold">지역 *</Label>
              <Select name="region" value={addRegion} onValueChange={(val) => setAddRegion(val)}>
                <SelectTrigger className="h-11 w-full text-base">
                  <SelectValue placeholder="지역 선택" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r} className="py-2 text-base">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 직종 */}
            <div className="space-y-1">
              <Label className="text-base font-semibold">직종 *</Label>
              <Select name="job_type" value={addJobType} onValueChange={(val) => setAddJobType(val)}>
                <SelectTrigger className="h-11 w-full text-base">
                  <SelectValue placeholder="직종 선택" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((j) => (
                    <SelectItem key={j} value={j} className="py-2 text-base">
                      {j}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 요구 경력 */}
            <div className="space-y-1">
              <Label htmlFor="required-career" className="text-base font-semibold">
                요구 경력 (년)
              </Label>
              <Input
                id="required-career"
                name="required_career"
                type="number"
                min={0}
                max={60}
                placeholder="예: 2"
                className="h-11 text-base"
              />
            </div>

            {/* 등록 버튼 */}
            <div className="flex items-end sm:col-span-2">
              <Button
                type="submit"
                disabled={addPending}
                className="h-11 w-full text-base sm:w-40"
              >
                {addPending ? '등록 중...' : '일자리 등록'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 일자리 목록 */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl">
            등록된 일자리{' '}
            <span className="text-blue-600">({jobs.length}건)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <p className="py-8 text-center text-lg text-gray-400">
              등록된 일자리가 없습니다.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-base">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50 text-left">
                    <th className="px-4 py-3 font-semibold text-gray-700">공고명</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">지역</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">직종</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">요구 경력</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{job.title}</td>
                      <td className="px-4 py-3 text-gray-700">{job.region}</td>
                      <td className="px-4 py-3 text-gray-700">{job.job_type}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {job.required_career > 0 ? `${job.required_career}년` : '무관'}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="destructive"
                          className="h-9 px-4 text-base"
                          disabled={isDeleting}
                          onClick={() => handleDelete(job.id)}
                        >
                          삭제
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
