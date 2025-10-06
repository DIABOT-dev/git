// Force dynamic để tránh SSG timeout
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Chat from "@ui/screens/Chat";
export default function Page(){ return <Chat/>; } // Chat tự đọc query qua useSearchParams
