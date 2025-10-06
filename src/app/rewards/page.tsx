import Rewards from "@ui/screens/Rewards";
import AuthGate from '@/interfaces/ui/components/AuthGate'; // Thêm dòng này

export default function Page(){
  return <AuthGate><Rewards/></AuthGate>; // Bọc Rewards bằng AuthGate
}