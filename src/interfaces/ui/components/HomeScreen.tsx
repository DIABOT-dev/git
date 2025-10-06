import Card from '@/interfaces/ui/components/atoms/Card' 
import ProgressItem from '@/interfaces/ui/components/ProgressItem'

export default function HomeScreen() {
  return (
    <div className="px-4 pb-20">
      <div className="bg-gradient-to-b from-primary/15 to-transparent rounded-xl3 p-4 mb-4">
        <p className="text-sm text-muted">Kế hoạch hôm nay</p>
        <h2 className="text-xl font-bold">Hãy hoàn thành các mục tiêu</h2>
      </div>

      <div className="grid gap-3">
        <ProgressItem title="Giấc ngủ" subtitle="Thiết lập chương trình" percent={70} value="7/8h" />
        <ProgressItem title="Chăm sóc" subtitle="Thiết lập chương trình" percent={60} value="2/3 nhiệm vụ" />
        <ProgressItem title="Hỗ trợ từ người thân" subtitle="Thiết lập chương trình" percent={20} value="1/5" />
        <ProgressItem title="Bước chân" percent={15} value="783 / 5,000" />
        <ProgressItem title="Kcal đã tiêu hao" percent={43} value="1,044 / 2,416" />
      </div>

      <div className="mt-4 grid gap-3">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Khám phá & nhận thưởng</p>
              <p className="text-sm text-muted">Hoàn thành thử thách để nhận điểm</p>
            </div>
            <button className="px-3 py-2 rounded-xl2 bg-primary text-white font-semibold">Mở</button>
          </div>
        </Card>
        <Card>
          <p className="font-semibold mb-1">Cộng đồng</p>
          <p className="text-sm text-muted">Tin tức & bài viết sức khỏe</p>
        </Card>
      </div>
    </div>
  )
}
