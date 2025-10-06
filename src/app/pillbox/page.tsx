import Pillbox from "@ui/screens/Pillbox";
import AuthGate from '@/interfaces/ui/components/AuthGate'; // Thêm dòng này

export default function Page(){
  return <AuthGate><Pillbox/></AuthGate>; // Bọc Pillbox bằng AuthGate
}