import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = {
  title: "시니어 프로필 등록 | 상상우리",
};

export default function RegisterPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900">시니어 프로필 등록</h1>
        <p className="text-lg text-gray-500">
          정보를 입력하시면 맞춤 일자리를 자동으로 추천해 드립니다.
        </p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl">기본 정보</CardTitle>
          <CardDescription className="text-base">
            * 표시는 필수 입력 항목입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 기능 구현은 다음 블록 — 뼈대만 */}
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg font-semibold">
                이름 *
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="홍길동"
                className="text-lg h-12"
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region" className="text-lg font-semibold">
                지역 *
              </Label>
              <Input
                id="region"
                name="region"
                placeholder="예: 서울 강남구"
                className="text-lg h-12"
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desired_job" className="text-lg font-semibold">
                희망 직종 *
              </Label>
              <Input
                id="desired_job"
                name="desired_job"
                placeholder="예: 경비원, 청소원, 요양보호사"
                className="text-lg h-12"
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="career_years" className="text-lg font-semibold">
                경력 연수 *
              </Label>
              <Input
                id="career_years"
                name="career_years"
                type="number"
                min={0}
                placeholder="예: 10"
                className="text-lg h-12"
                disabled
              />
            </div>

            <Button
              type="submit"
              className="w-full text-xl py-7 bg-blue-600 hover:bg-blue-700 text-white"
              disabled
            >
              프로필 등록하기
            </Button>

            <p className="text-center text-base text-gray-400">
              — 기능 구현 예정 (다음 단계) —
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
