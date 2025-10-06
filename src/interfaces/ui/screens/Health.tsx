import Card from '@/interfaces/ui/components/atoms/Card'
import dynamic from "next/dynamic";

const GlucoseLine = dynamic(() => import('@components/charts/GlucoseLine'), { 
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center"><p className="text-sm text-gray-500">Đang tải biểu đồ…</p></div>
})

const data=[
  { d:'T1', glucose:115, steps:3200, kcal:420 },
  { d:'T2', glucose:122, steps:4000, kcal:520 },
  { d:'T3', glucose:138, steps:2500, kcal:410 },
  { d:'T4', glucose:126, steps:5300, kcal:580 },
  { d:'T5', glucose:118, steps:6100, kcal:640 },
  { d:'T6', glucose:129, steps:4700, kcal:500 },
  { d:'T7', glucose:124, steps:5800, kcal:610 },
]

export default function Health(){
  return (
    <div className="px-4 pb-32 grid gap-4">
      <Card>
        <p className="font-semibold mb-2">Biểu đồ tổng hợp (7 ngày)</p>
        <GlucoseLine data={data.map(d => ({ d: d.d, glucose: d.glucose }))} />
      </Card>
      <Card>
        <p className="font-semibold mb-2">Nhật ký cá nhân</p>
        <div className="grid grid-cols-3 text-sm gap-2">
          <div><strong>Hôm qua</strong><p>Glucose: 128</p><p>Nước: 6 cốc</p></div>
          <div><strong>Tuần</strong><p>Logs: 12</p><p>Bước: 28k</p></div>
          <div><strong>Thuốc</strong><p>Metformin: 6/7</p><p>Statin: 5/7</p></div>
        </div>
      </Card>
    </div>
  )
}