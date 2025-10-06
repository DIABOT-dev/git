import Card from '@/interfaces/ui/components/atoms/Card'
import { mockProfile as p } from '@/mock/profile'
export default function Me(){
  const reset = () => alert('Đã reset profile demo (mô phỏng).')
  return (
    <div className='px-4 pb-32 grid gap-3'>
      <Card>
        <p className='font-semibold mb-1'>Hồ sơ cá nhân (Demo)</p>
        <div className='grid grid-cols-2 gap-2 text-sm'>
          <div><strong>Họ tên:</strong> {p.name}</div>
          <div><strong>Ngày sinh:</strong> {p.dob}</div>
          <div><strong>Giới tính:</strong> {p.gender}</div>
          <div><strong>Liên hệ:</strong> {p.phone}</div>
          <div className='col-span-2'><strong>Email:</strong> {p.email}</div>
        </div>
      </Card>
      <Card>
        <p className='font-semibold mb-1'>Mục tiêu</p>
        <ul className='list-disc pl-5 text-sm'>
          <li>HbA1c mục tiêu: {p.goals.hba1c}%</li>
          <li>Cân nặng: {p.goals.weight.current}kg → {p.goals.weight.target}kg</li>
          <li>Bước/ngày: {p.goals.steps}</li>
          <li>Nước/ngày: {p.goals.waterCups} cốc</li>
        </ul>
      </Card>
      <Card>
        <p className='font-semibold mb-1'>Bệnh lý & Thuốc</p>
        <p className='text-sm'>Bệnh: {p.conditions.join(', ')}</p>
        <p className='text-sm'>Thuốc: {p.medications.join('; ')}</p>
      </Card>
      <Card>
        <p className='font-semibold mb-1'>Người thân & cài đặt</p>
        <p className='text-sm'>Người chăm sóc: {p.caregivers[0].name} ({p.caregivers[0].role}) – {p.caregivers[0].phone}</p>
        <p className='text-sm'>Chia sẻ dữ liệu: {p.settings.shareWithCaregiver ? 'Có' : 'Không'}</p>
        <p className='text-sm'>Nhắc nhở: {p.settings.reminders.join(', ')}</p>
      </Card>
      <button onClick={reset} className='btn-outline'>Reset profile demo</button>
    </div>
  )
}