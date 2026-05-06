import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const menu = [
  {
    href: "/register",
    title: "시니어 프로필 등록",
    description: "이름, 지역, 희망 직종, 경력을 입력해 일자리 매칭을 시작하세요.",
    btnClass: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  {
    href: "/recommendations",
    title: "추천 일자리 목록",
    description: "등록된 프로필을 바탕으로 자동 매칭된 일자리를 점수순으로 확인하세요.",
    btnClass: "bg-green-600 hover:bg-green-700 text-white",
  },
  {
    href: "/admin",
    title: "담당자 대시보드",
    description: "미매칭·대기·배정 완료 현황을 한눈에 관리하세요.",
    btnClass: "bg-purple-600 hover:bg-purple-700 text-white",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center space-y-3 py-8">
        <h1 className="text-4xl font-bold text-blue-700">상상우리</h1>
        <p className="text-2xl text-gray-700">시니어 ↔ 일자리 자동 매칭 시스템</p>
        <p className="text-lg text-gray-500">
          프로필을 등록하면 적합한 일자리를 자동으로 추천해 드립니다.
        </p>
      </section>

      <div className="grid gap-6 sm:grid-cols-3">
        {menu.map((item) => (
          <Card key={item.href} className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="space-y-4">
              <CardTitle className="text-xl">{item.title}</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                {item.description}
              </CardDescription>
              <Link
                href={item.href}
                className={`flex items-center justify-center w-full rounded-lg text-lg font-semibold py-4 transition-opacity hover:opacity-90 ${item.btnClass}`}
              >
                바로 가기
              </Link>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
