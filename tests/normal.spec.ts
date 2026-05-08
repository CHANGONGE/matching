import { test, expect } from '@playwright/test'
import { clearDb, insertJob, getSeniorByName } from './helpers/db'

test.describe('정상 시나리오', () => {
  test.beforeEach(async () => {
    await clearDb()
    // 서울·경비·경력 3년 요구 공고 1건 준비
    await insertJob({ title: '서울 경비 공고', region: '서울', job_type: '경비', required_career: 3 })
  })

  test('시니어 등록 후 6점 금색 배지 카드가 추천 목록 상단에 표시된다', async ({ page }) => {
    await page.goto('/register')

    // 이름 입력
    await page.getByLabel('이름 *').fill('테스트시니어')

    // 지역 선택 (첫 번째 combobox)
    await page.getByRole('combobox').nth(0).click()
    await page.getByRole('option', { name: '서울' }).click()

    // 희망 직종 선택 (두 번째 combobox)
    await page.getByRole('combobox').nth(1).click()
    await page.getByRole('option', { name: '경비' }).click()

    // 경력 입력
    await page.locator('#career_years').fill('5')

    // 제출
    await page.getByRole('button', { name: '프로필 등록하기' }).click()

    // 성공 박스 확인
    await expect(page.getByText('등록이 완료되었습니다')).toBeVisible({ timeout: 15_000 })

    // DB에서 방금 생성된 시니어 ID 조회
    const senior = await getSeniorByName('테스트시니어')
    expect(senior).not.toBeNull()
    const seniorId = senior!.id

    // 추천 목록 페이지 이동
    await page.goto(`/recommendations?senior_id=${seniorId}`)

    // 6점 금색(bg-yellow-500) 배지가 첫 번째 카드에 표시되는지 확인
    const goldBadge = page.locator('.bg-yellow-500').first()
    await expect(goldBadge).toBeVisible()
    await expect(goldBadge).toContainText('6점')
  })
})
