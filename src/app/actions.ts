'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import type { Job, Senior } from '@/lib/supabase'

// ── 앱 레이어 점수 계산 (RPC 폴백용) ─────────────────────────────────────
function calcScore(senior: Senior, job: Job): number {
  let score = 0
  if (senior.region === job.region) score += 3
  if (senior.desired_job === job.job_type) score += 2
  if (senior.career_years >= job.required_career) score += 1
  return score
}

async function rematchSeniorFallback(senior: Senior): Promise<void> {
  const { data: jobs } = await supabase.from('jobs').select('*')
  await supabase.from('matches').delete().eq('senior_id', senior.id)
  const rows = (jobs ?? []).map(job => ({
    senior_id: senior.id,
    job_id: job.id,
    score: calcScore(senior, job),
    status: 'pending' as const,
  }))
  if (rows.length > 0) await supabase.from('matches').insert(rows)
}

async function rematchJobFallback(job: Job): Promise<void> {
  const { data: seniors } = await supabase.from('seniors').select('*')
  await supabase.from('matches').delete().eq('job_id', job.id)
  const rows = (seniors ?? []).map(senior => ({
    senior_id: senior.id,
    job_id: job.id,
    score: calcScore(senior, job),
    status: 'pending' as const,
  }))
  if (rows.length > 0) await supabase.from('matches').insert(rows)
}

// ── 시니어 등록 ──────────────────────────────────────────────────────────
export type SeniorFormState = {
  success?: boolean
  errors?: {
    name?: string
    region?: string
    desired_job?: string
    server?: string
  }
}

export async function insertSeniorAction(
  _prevState: SeniorFormState,
  formData: FormData,
): Promise<SeniorFormState> {
  const name = ((formData.get('name') as string | null) ?? '').trim()
  const region = (formData.get('region') as string | null) ?? ''
  const desired_job = (formData.get('desired_job') as string | null) ?? ''
  const careerRaw = formData.get('career_years') as string | null
  const career_years = careerRaw ? parseInt(careerRaw, 10) : 0

  const errors: SeniorFormState['errors'] = {}
  if (!name) errors.name = '이름을 입력해 주세요.'
  if (!region) errors.region = '지역을 선택해 주세요.'
  if (!desired_job) errors.desired_job = '희망 직종을 선택해 주세요.'
  if (Object.keys(errors).length > 0) return { errors }

  const { data: newSenior, error } = await supabase
    .from('seniors')
    .insert({ name, region, desired_job, career_years: isNaN(career_years) ? 0 : career_years })
    .select()
    .single()

  if (error || !newSenior) {
    return { errors: { server: '저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' } }
  }

  // 매칭 점수 재계산 — RPC 우선, 실패 시 앱 레이어 폴백
  const { error: rpcError } = await supabase.rpc('rematch_senior', { p_senior_id: newSenior.id })
  if (rpcError) await rematchSeniorFallback(newSenior)

  revalidatePath('/recommendations')
  revalidatePath('/admin')
  return { success: true }
}

// ── 일자리 등록 ──────────────────────────────────────────────────────────
export type JobFormState = {
  success?: boolean
  newJob?: Job
  error?: string
}

export async function insertJobAction(
  _prevState: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const title = ((formData.get('title') as string | null) ?? '').trim()
  const region = (formData.get('region') as string | null) ?? ''
  const job_type = (formData.get('job_type') as string | null) ?? ''
  const careerRaw = formData.get('required_career') as string | null
  const required_career = careerRaw ? parseInt(careerRaw, 10) : 0

  if (!title || !region || !job_type) {
    return { error: '공고명, 지역, 직종은 필수 항목입니다.' }
  }

  const { data: newJob, error } = await supabase
    .from('jobs')
    .insert({ title, region, job_type, required_career: isNaN(required_career) ? 0 : required_career })
    .select()
    .single()

  if (error || !newJob) return { error: '저장 중 오류가 발생했습니다.' }

  // 매칭 점수 재계산 — RPC 우선, 실패 시 앱 레이어 폴백
  const { error: rpcError } = await supabase.rpc('rematch_job', { p_job_id: newJob.id })
  if (rpcError) await rematchJobFallback(newJob)

  revalidatePath('/admin')
  revalidatePath('/recommendations')
  return { success: true, newJob }
}

// ── 매칭 status 변경 ─────────────────────────────────────────────────────
export type MatchStatus = 'pending' | 'assigned' | 'done'

export async function updateMatchStatusAction(
  matchId: string,
  status: MatchStatus,
): Promise<{ success: boolean }> {
  const { error } = await supabase.from('matches').update({ status }).eq('id', matchId)
  if (error) return { success: false }
  revalidatePath('/recommendations')
  revalidatePath('/admin')
  return { success: true }
}

// ── 일자리 삭제 ──────────────────────────────────────────────────────────
export async function deleteJobAction(jobId: string): Promise<{ success: boolean }> {
  // FK 제약 때문에 matches 먼저 삭제
  await supabase.from('matches').delete().eq('job_id', jobId)

  const { error } = await supabase.from('jobs').delete().eq('id', jobId)
  if (error) return { success: false }

  revalidatePath('/admin')
  revalidatePath('/recommendations')
  return { success: true }
}
