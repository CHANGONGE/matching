import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "추천 일자리 목록 | 상상우리",
};

const placeholderItems = [
  { rank: 1, name: "홍길동", job: "경비원", region: "서울 강남구", score: 95 },
  { rank: 2, name: "김순자", job: "청소원", region: "부산 해운대구", score: 88 },
  { rank: 3, name: "박영수", job: "요양보호사", region: "인천 남동구", score: 76 },
];

export default function RecommendationsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900">자동 매칭 추천 목록</h1>
        <p className="text-lg text-gray-500">
          매칭 점수 높은 순으로 정렬됩니다. 아래는 예시 데이터입니다.
        </p>
      </div>

      {/* 기능 구현은 다음 블록 — 뼈대 + 예시 데이터 */}
      <div className="space-y-4">
        {placeholderItems.map((item) => (
          <Card key={item.rank} className="border-2 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  <span className="text-gray-400 mr-2">#{item.rank}</span>
                  {item.name}
                </CardTitle>
                <Badge className="text-lg px-3 py-1 bg-blue-600 text-white">
                  점수 {item.score}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6 text-lg text-gray-700">
                <span>
                  <span className="font-semibold">희망 직종:</span> {item.job}
                </span>
                <span>
                  <span className="font-semibold">지역:</span> {item.region}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-center text-base text-gray-400 py-4">
        — 실제 데이터 연동 및 매칭 로직은 다음 단계에서 구현됩니다 —
      </p>
    </div>
  );
}
