import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Sử dụng key thật hoặc fallback key tạm để server không bị crash lúc khởi động
const apiKey = process.env.RESEND_API_KEY;
const resend = new Resend(apiKey);

if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️ CẢNH BÁO: Chưa tìm thấy biến môi trường RESEND_API_KEY trong file .env');
  console.warn('⚠️ Việc gửi email sẽ thất bại cho đến khi bạn cung cấp API Key hợp lệ.');
}
const SENDER_EMAIL = 'no-reply@huunguyen.xyz'; // Using the default free-tier sender for now

export const emailService = {
  /**
   * REQ-007: Gửi email xác nhận sau khi nộp hồ sơ
   */
  async sendApplicationConfirmation(email: string, candidateName: string, jobTitle: string) {
    try {
      await resend.emails.send({
        from: `Recruitment System <${SENDER_EMAIL}>`,
        to: email,
        subject: 'Xác nhận nộp hồ sơ thành công',
        html: `
          <h3>Xin chào ${candidateName},</h3>
          <p>Cảm ơn bạn đã quan tâm và ứng tuyển vào vị trí <strong>${jobTitle}</strong> tại công ty chúng tôi.</p>
          <p>Chúng tôi đã nhận được hồ sơ của bạn và sẽ tiến hành xem xét. Nếu hồ sơ phù hợp, bộ phận Tuyển dụng sẽ liên hệ với bạn trong thời gian sớm nhất.</p>
          <br/>
          <p>Trân trọng,</p>
          <p><strong>Phòng Tuyển dụng</strong></p>
        `,
      });
    } catch (error) {
      console.error('Error sending application confirmation email:', error);
    }
  },

  /**
   * REQ-010: Gửi email từ chối
   */
  async sendApplicationRejection(email: string, candidateName: string, jobTitle: string) {
    try {
      await resend.emails.send({
        from: `Recruitment System <${SENDER_EMAIL}>`,
        to: email,
        subject: 'Thông báo kết quả ứng tuyển',
        html: `
          <h3>Xin chào ${candidateName},</h3>
          <p>Cảm ơn bạn đã dành thời gian ứng tuyển vào vị trí <strong>${jobTitle}</strong>.</p>
          <p>Sau khi xem xét kỹ lưỡng, chúng tôi rất tiếc phải thông báo rằng hồ sơ của bạn chưa phù hợp với yêu cầu của vị trí này trong thời điểm hiện tại.</p>
          <p>Chúng tôi sẽ lưu lại hồ sơ của bạn và liên hệ lại nếu có cơ hội việc làm phù hợp trong tương lai.</p>
          <br/>
          <p>Chúc bạn nhiều thành công trên con đường sự nghiệp!</p>
          <p>Trân trọng,</p>
          <p><strong>Phòng Tuyển dụng</strong></p>
        `,
      });
    } catch (error) {
      console.error('Error sending application rejection email:', error);
    }
  },

  /**
   * REQ-012: Gửi email mời phỏng vấn
   */
  async sendInterviewInvitation(email: string, candidateName: string, jobTitle: string, interviewDetails: any) {
    try {
      const formattedDate = new Date(interviewDetails.interviewDate).toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        dateStyle: 'full',
        timeStyle: 'short',
      });

      await resend.emails.send({
        from: `Recruitment System <${SENDER_EMAIL}>`,
        to: email,
        subject: `Thư mời tham gia phỏng vấn - Vị trí ${jobTitle}`,
        html: `
          <h3>Xin chào ${candidateName},</h3>
          <p>Chúc mừng bạn đã vượt qua vòng sơ loại hồ sơ cho vị trí <strong>${jobTitle}</strong>.</p>
          <p>Chúng tôi trân trọng mời bạn tham gia buổi phỏng vấn với thông tin chi tiết như sau:</p>
          <ul>
            <li><strong>Thời gian:</strong> ${formattedDate}</li>
            <li><strong>Địa điểm / Link họp:</strong> ${interviewDetails.location}</li>
            <li><strong>Hình thức phỏng vấn:</strong> ${interviewDetails.type}</li>
          </ul>
          <p>Vui lòng sắp xếp thời gian tham dự và phản hồi lại email này hoặc truy cập hệ thống để xác nhận tham gia.</p>
          <br/>
          <p>Trân trọng,</p>
          <p><strong>Phòng Tuyển dụng</strong></p>
        `,
      });
    } catch (error) {
      console.error('Error sending interview invitation email:', error);
    }
  },

  /**
   * REQ-017: Gửi email Offer (thư mời nhận việc) với 2 nút Accept/Decline
   */
  async sendOfferLetter(email: string, candidateName: string, jobTitle: string, offerDetails: any) {
    try {
      const formattedDate = new Date(offerDetails.startDate).toLocaleDateString('vi-VN');

      await resend.emails.send({
        from: `Recruitment System <${SENDER_EMAIL}>`,
        to: email,
        subject: `Thư mời nhận việc (Offer Letter) - Vị trí ${jobTitle}`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🎉 Chúc mừng!</h1>
              <p style="color: #e8e0ff; margin-top: 8px; font-size: 14px;">Bạn đã vượt qua vòng tuyển dụng</p>
            </div>
            
            <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
              <h3 style="color: #1f2937; margin-top: 0;">Xin chào ${candidateName},</h3>
              <p style="color: #4b5563; line-height: 1.6;">Chúng tôi rất vui mừng gửi đến bạn lời đề nghị làm việc cho vị trí <strong style="color: #667eea;">${jobTitle}</strong> với thông tin như sau:</p>
              
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Mức lương cơ bản:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${offerDetails.basicSalary.toLocaleString('vi-VN')} VNĐ</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Mức lương thử việc (85%):</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${offerDetails.probationSalary.toLocaleString('vi-VN')} VNĐ</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Ngày bắt đầu dự kiến:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${formattedDate}</td>
                  </tr>
                </table>
              </div>

              <p style="color: #4b5563; line-height: 1.6;">Vui lòng phản hồi bằng cách chọn một trong hai lựa chọn bên dưới:</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${offerDetails.acceptUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin-right: 12px;">✅ Chấp nhận Offer</a>
                <a href="${offerDetails.declineUrl}" style="display: inline-block; background: #ffffff; color: #ef4444; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; border: 2px solid #ef4444;">❌ Từ chối Offer</a>
              </div>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">Nếu các nút không hoạt động, vui lòng sao chép và dán link dưới đây vào trình duyệt:</p>
              <p style="color: #9ca3af; font-size: 11px; word-break: break-all; text-align: center;">Chấp nhận: ${offerDetails.acceptUrl}</p>
              <p style="color: #9ca3af; font-size: 11px; word-break: break-all; text-align: center;">Từ chối: ${offerDetails.declineUrl}</p>
            </div>
            
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="color: #6b7280; font-size: 13px; margin: 0;">Trân trọng,<br/><strong>Phòng Tuyển dụng</strong></p>
            </div>
          </div>
        `,
      });
    } catch (error) {
      console.error('Error sending offer letter email:', error);
    }
  },

  /**
   * REQ-019: Gửi email tài khoản đăng nhập khi chấp nhận Offer
   */
  async sendOnboardingCredentials(email: string, candidateName: string, loginDetails: any) {
    try {
      await resend.emails.send({
        from: `Recruitment System <${SENDER_EMAIL}>`,
        to: email,
        subject: 'Thông tin tài khoản truy cập hệ thống nhân sự',
        html: `
          <h3>Xin chào ${candidateName},</h3>
          <p>Cảm ơn bạn đã chấp nhận Offer. Dưới đây là thông tin tài khoản để bạn truy cập vào hệ thống dành cho nhân viên thử việc:</p>
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;">
            <p><strong>Tên đăng nhập (Username):</strong> ${loginDetails.username}</p>
            <p><strong>Mật khẩu tạm thời:</strong> ${loginDetails.password}</p>
          </div>
          <p>Vui lòng đăng nhập và đổi mật khẩu trong lần đầu truy cập để bảo mật thông tin.</p>
          <br/>
          <p>Trân trọng,</p>
          <p><strong>Phòng Nhân sự</strong></p>
        `,
      });
    } catch (error) {
      console.error('Error sending onboarding credentials email:', error);
    }
  },

  /**
   * REQ-022: Gửi email nhắc nhở HM đánh giá thử việc
   */
  async sendProbationReminder(hmEmail: string, hmName: string, probationerName: string) {
    try {
      await resend.emails.send({
        from: `Recruitment System <${SENDER_EMAIL}>`,
        to: hmEmail,
        subject: `Nhắc nhở: Đánh giá thử việc - ${probationerName}`,
        html: `
          <h3>Xin chào ${hmName},</h3>
          <p>Hệ thống thông báo nhân viên thử việc <strong>${probationerName}</strong> sắp hết hạn thời gian thử việc.</p>
          <p>Vui lòng sắp xếp thời gian để vào hệ thống và hoàn thành Phiếu đánh giá kết quả thử việc cho nhân viên này.</p>
          <br/>
          <p>Trân trọng,</p>
          <p><strong>Hệ thống Quản lý Tuyển dụng</strong></p>
        `,
      });
    } catch (error) {
      console.error('Error sending probation reminder email:', error);
    }
  },

  /**
   * REQ-025: Gửi email thông báo kết quả thử việc
   */
  async sendProbationResult(email: string, probationerName: string, resultDetails: any) {
    try {
      const resultText = resultDetails.recommendation === 'Pass' ? 'ĐẠT' : 'KHÔNG ĐẠT';
      await resend.emails.send({
        from: `Recruitment System <${SENDER_EMAIL}>`,
        to: email,
        subject: `Thông báo Kết quả đánh giá thử việc`,
        html: `
          <h3>Xin chào ${probationerName},</h3>
          <p>Ban Giám đốc đã hoàn tất việc xem xét đánh giá quá trình thử việc của bạn.</p>
          <p>Kết quả cuối cùng: <strong>${resultText}</strong>.</p>
          <p>Nhận xét chung: ${resultDetails.note || 'Không có nhận xét thêm'}</p>
          <br/>
          <p>Bộ phận Nhân sự sẽ liên hệ với bạn trong thời gian sớm nhất về các thủ tục tiếp theo.</p>
          <p>Trân trọng,</p>
          <p><strong>Phòng Nhân sự</strong></p>
        `,
      });
    } catch (error) {
      console.error('Error sending probation result email:', error);
    }
  }
};
