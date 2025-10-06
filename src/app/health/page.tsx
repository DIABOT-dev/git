// Force dynamic để tránh SSG timeout
export const dynamic = 'force-dynamic';
export const revalidate = 0;


import Health from "@ui/screens/Health";
import AuthGate from '@/interfaces/ui/components/AuthGate'; // Thêm dòng này

export default function Page(){ return <AuthGate><Health/></AuthGate>; } // Bọc Health bằng AuthGate