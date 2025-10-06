// /src/app/medical-disclaimer/page.tsx
import BackHomeBar from "@/components/BackHomeBar";
import LegalContainer from "@/components/LegalContainer";

export default function MedicalDisclaimerPage() {
  return (
    <>
      <BackHomeBar title="Medical Disclaimer / Tuyên bố y tế" />
      <LegalContainer>
        <article className="prose prose-sm max-w-none dark:prose-invert">
          <h2>Medical Disclaimer / Tuyên bố miễn trừ y tế</h2>
          <p><strong>EN:</strong> DIABOT supports lifestyle tracking… It does not diagnose, treat, or replace professional medical advice. If severe symptoms occur, seek emergency care immediately.</p>
          <p><strong>VI:</strong> DIABOT hỗ trợ theo dõi lối sống… không chẩn đoán/điều trị/thay thế bác sĩ. Nếu có triệu chứng nặng, hãy gọi cấp cứu hoặc đến cơ sở y tế ngay.</p>
          <ul>
            <li>AI gợi ý chỉ mang tính tham khảo, dựa trên dữ liệu bạn nhập.</li>
            <li>Nhắc nhở có thể bật/tắt trong Cài đặt.</li>
          </ul>
        </article>
        <div className="h-[84px]" aria-hidden /> {/* chêm khoảng tránh bị BottomNav che nếu có */}
      </LegalContainer>
    </>
  );
}
