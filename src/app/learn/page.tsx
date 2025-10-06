import Learn from "@ui/screens/Learn";
import AuthGate from '@/interfaces/ui/components/AuthGate'; // Thêm dòng này

export default function Page(){
  return <AuthGate><Learn/></AuthGate>; // Bọc Learn bằng AuthGate
}