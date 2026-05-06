import { RegisterForm } from './register-form'

export const metadata = {
  title: '시니어 프로필 등록 | 상상우리',
}

export default function RegisterPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900">시니어 프로필 등록</h1>
        <p className="text-lg text-gray-500">
          정보를 입력하시면 맞춤 일자리를 자동으로 추천해 드립니다.
        </p>
      </div>
      <RegisterForm />
    </div>
  )
}
