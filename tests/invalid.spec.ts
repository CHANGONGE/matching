import { test, expect } from '@playwright/test'
import { clearDb, countSeniors } from './helpers/db'

test.describe('실패 시나리오', () => {
  test.beforeEach(async () => {
    await clearDb()
  })

  test('이름 미입력 시 빨간 오류 박스가 뜨고 DB에 레코드가 생성되지 않는다', async ({ page }) => {
    await page.goto('/register')

    // 이름은 비운 채로 지역·직종·경력만 입력
    await page.getByRole('combobox').nth(0).click()
    await page.getByRole('option', { name: '서울' }).click()

    await page.getByRole('combobox').nth(1).click()
    await page.getByRole('option', { name: '경비' }).click()

    await page.locator('#career_years').fill('3')

    // 제출
    await page.getByRole('button', { name: '프로필 등록하기' }).click()

    // 이름 필드 위 빨간 오류 박스 확인
    await expect(page.getByText('이름을 입력해 주세요.')).toBeVisible({ timeout: 15_000 })

    // DB에 새 레코드가 없는지 확인
    const count = await countSeniors()
    expect(count).toBe(0)
  })
})
