export const mockProfile = {
  name: 'Nguyễn Văn A',
  dob: '1960-03-12',
  gender: 'Nam',
  phone: '09xx xxx xxx',
  email: 'nguyenvana@example.com',
  goals: { hba1c: 6.5, weight: { current: 67, target: 65 }, steps: 6000, waterCups: 6 },
  conditions: ['ĐTĐ type 2 (2015)', 'Cao huyết áp nhẹ'],
  medications: ['Metformin 500mg x2/ngày', 'Amlodipine 5mg x1/ngày'],
  caregivers: [{ name: 'Nguyễn Thị B', role: 'Con gái', phone: '09xx xxx xxx' }],
  settings: { shareWithCaregiver: true, reminders: ['FPG sáng', 'PP2 tối'] }
} as const;