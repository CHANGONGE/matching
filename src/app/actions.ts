'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import type { Job } from '@/lib/supabase'

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

  const { error } = await supabase
    .from('seniors')
    .insert({ name, region, desired_job, career_years: isNaN(career_years) ? 0 : career_years })

  if (error) return { errors: { server: '저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' } }

  return { success: true }
}

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

  const { data, error } = await supabase
    .from('jobs')
    .insert({ title, region, job_type, required_career: isNaN(required_career) ? 0 : required_career })
    .select()
    .single()

  if (error) return { error: '저장 중 오류가 발생했습니다.' }

  revalidatePath('/admin')
  return { success: true, newJob: data }
}

export async function deleteJobAction(jobId: string): Promise<{ success: boolean }> {
  const { error } = await supabase.from('jobs').delete().eq('id', jobId)
  if (error) return { success: false }
  revalidatePath('/admin')
  return { success: true }
}
