import { test, expect } from '@playwright/test'
import { clearDb, insertJob, getSeniorByName } from './helpers/db'

test.describe('엣지 시나리오 - 매칭 없음', () => {
  test.beforeEach(async () => {
    await clearDb()
    // 서울·경비·3년 시니어와 점수 0이 되는 공고:
    //   region·job_type 불일치(0점) + required_career=10 > career_years=3(0점) → 합계 0점
    // required_career를 0으로 두면 career 조건(3>=0)이 충족돼 1점이 생기므로 10으로 설정
    await insertJob({ title: '기타 공고', region: '기타', job_type: '기타', required_career: 10 })
  })

  test('매칭 점수 0인 공고만 있으면 추천 목록에 안내 메시지가 표시된다', async ({ page }) => {
    await page.goto('/register')

    await page.getByLabel('이름 *').fill('매칭없는시니어')

    await page.getByRole('combobox').nth(0).click()
    await page.getByRole('option', { name: '서울' }).click()

    await page.getByRole('combobox').nth(1).click()
    await page.getByRole('option', { name: '경비' }).click()

    await page.locator('#career_years').fill('3')

    await page.getByRole('button', { name: '프로필 등록하기' }).click()

    await expect(page.getByText('등록이 완료되었습니다')).toBeVisible({ timeout: 15_000 })

    const senior = await getSeniorByName('매칭없는시니어')
    expect(senior).not.toBeNull()
    const seniorId = senior!.id

    await page.goto(`/recommendations?senior_id=${seniorId}`)

    await expect(page.getByText('현재 매칭되는 일자리가 없습니다')).toBeVisible()
  })
})
