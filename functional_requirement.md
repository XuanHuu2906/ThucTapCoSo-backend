**1. Đăng nhập/ Xác thực**

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-001
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải xác thực người dùng
                                      bằng cách kiểm tra email và mật
                                      khẩu với cơ sở dữ liệu người dùng.

  Lý do (Rationale)                   Đảm bảo chỉ người dùng được ủy
                                      quyền mới có thể truy cập hệ thống,
                                      bảo vệ dữ liệu tuyển dụng và thông
                                      tin ứng viên khỏi truy cập trái
                                      phép.

  Use Case nguồn                      UC-01

  Mức ưu tiên                         Cao

  Tiêu chí chấp nhận                  AC-1: Given người dùng nhập email
                                      và mật khẩu hợp lệ, When nhấn
                                      \"Đăng nhập\", Then hệ thống xác
                                      thực và chuyển đến trang chủ theo
                                      vai trò.\
                                      \
                                      AC-2: Given người dùng nhập thông
                                      tin không hợp lệ, When nhấn \"Đăng
                                      nhập\", Then hiển thị \"Email hoặc
                                      mật khẩu không đúng\".\
                                      \
                                      AC-3: Given tài khoản bị khóa, When
                                      cố gắng đăng nhập, Then hiển thị
                                      \"Tài khoản đã bị khóa. Liên hệ
                                      Admin.\"
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-002
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải chuyển hướng người
                                      dùng đến trang chủ tương ứng với
                                      vai trò (Recruiter, Hiring Manager,
                                      Director, Admin, Probationer).

  Lý do (Rationale)                   Mỗi vai trò có chức năng khác nhau,
                                      cần hiển thị giao diện phù hợp để
                                      tối ưu trải nghiệm và hiệu quả làm
                                      việc.

  Use Case nguồn                      UC-01

  Mức ưu tiên                         Cao

  Tiêu chí chấp nhận                  AC-1: Given Recruiter đăng nhập,
                                      When xác thực thành công, Then hiển
                                      thị Dashboard Recruiter.\
                                      \
                                      AC-2: Given Director đăng nhập,
                                      When xác thực thành công, Then hiển
                                      thị Dashboard Director với báo cáo
                                      điều hành.\
                                      \
                                      AC-3: Given Probationer đăng nhập,
                                      When xác thực thành công, Then hiển
                                      thị trang thông tin thử việc (chỉ
                                      đọc).
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-003
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải cung cấp chức năng
                                      khôi phục mật khẩu qua email khi
                                      người dùng chọn \"Quên mật khẩu\".

  Lý do (Rationale)                   Cho phép người dùng tự phục vụ khôi
                                      phục quyền truy cập, giảm tải công
                                      việc hỗ trợ của Admin.

  Use Case nguồn                      UC-01

  Mức ưu tiên                         Trung bình

  Tiêu chí chấp nhận                  AC-1: Given người dùng nhập email
                                      đã đăng ký, When yêu cầu đặt lại
                                      mật khẩu, Then gửi link đặt lại đến
                                      email.\
                                      \
                                      AC-2: Given email chưa đăng ký,
                                      When yêu cầu đặt lại, Then hiển thị
                                      thông báo chung không tiết lộ email
                                      có tồn tại hay không (bảo mật).
  -----------------------------------------------------------------------

# 2. QUẢN LÝ TUYỂN DỤNG

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-004
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải cho phép Recruiter
                                      tạo tin tuyển dụng với các trường
                                      bắt buộc: tiêu đề, mô tả công việc,
                                      yêu cầu, mức lương, hạn nộp.

  Lý do (Rationale)                   Tin tuyển dụng đầy đủ thông tin
                                      giúp thu hút ứng viên phù hợp và
                                      lọc ứng viên không phù hợp ngay từ
                                      đầu.

  Use Case nguồn                      UC-02

  Mức ưu tiên                         Cao

  Tiêu chí chấp nhận                  AC-1: Given Recruiter điền đủ
                                      trường và nhấn \"Đăng tin\", Then
                                      lưu status=\"Published\" và hiển
                                      thị công khai.\
                                      \
                                      AC-2: Given thông tin chưa đủ, When
                                      cố đăng tin, Then hiển thị lỗi
                                      validation.\
                                      \
                                      AC-3: Given nhấn \"Lưu nháp\", When
                                      tin chưa đủ, Then lưu
                                      status=\"Draft\" không validate và
                                      không hiển thị công khai.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-005
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải cho phép Recruiter
                                      chỉnh sửa hoặc đóng tin tuyển dụng
                                      đã đăng.

  Lý do (Rationale)                   Yêu cầu tuyển dụng có thể thay đổi
                                      hoặc đã tuyển đủ, cần cập nhật hoặc
                                      ngừng nhận hồ sơ.

  Use Case nguồn                      UC-02

  Mức ưu tiên                         Trung bình

  Tiêu chí chấp nhận                  AC-1: Given tin tồn tại, When chỉnh
                                      sửa và lưu, Then cập nhật ngay lập
                                      tức.\
                                      \
                                      AC-2: Given tin đang Published,
                                      When nhấn \"Đóng tin\", Then cập
                                      nhật status=\"Closed\", gỡ khỏi
                                      hiển thị công khai.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-006
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải cho phép ứng viên nộp
                                      hồ sơ gồm họ tên, email (dùng làm
                                      username), số điện thoại, và file
                                      CV.

  Lý do (Rationale)                   Thu thập thông tin cơ bản để liên
                                      hệ và đánh giá. Email làm username
                                      cho tài khoản sau này nếu được
                                      tuyển.

  Use Case nguồn                      UC-03

  Mức ưu tiên                         Cao

  Tiêu chí chấp nhận                  AC-1: Given ứng viên điền đủ và
                                      upload CV hợp lệ, When gửi hồ sơ,
                                      Then kiểm tra file, lưu database,
                                      gửi email xác nhận.\
                                      \
                                      AC-2: Given file không hợp lệ hoặc
                                      \>5MB, When gửi, Then báo lỗi
                                      \"File không hợp lệ. Upload
                                      PDF/DOC/DOCX \<5MB\".\
                                      \
                                      AC-3: Given email đã tồn tại, When
                                      gửi, Then báo \"Email đã đăng ký.\"
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-007
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải tự động gửi email xác
                                      nhận đến ứng viên sau khi hồ sơ lưu
                                      thành công.

  Lý do (Rationale)                   Tạo trải nghiệm chuyên nghiệp, xác
                                      nhận hồ sơ đã nhận, cung cấp mã
                                      tham chiếu để theo dõi.

  Use Case nguồn                      UC-03

  Mức ưu tiên                         Cao

  Tiêu chí chấp nhận                  AC-1: Given hồ sơ lưu thành công,
                                      When hoàn tất lưu, Then gửi email
                                      xác nhận trong vòng 1 phút.\
                                      \
                                      AC-2: Given email gửi thất bại (lỗi
                                      SMTP), When phát hiện lỗi, Then ghi
                                      log và thử lại tối đa 3 lần trong
                                      30 phút.
  -----------------------------------------------------------------------

# 3. SÀNG LỌC HỒ SƠ

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-008
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải hiển thị thông tin
                                      ứng viên và cho phép xem CV trực
                                      tiếp trên trình duyệt.

  Lý do (Rationale)                   Recruiter cần xem nhanh nhiều CV để
                                      sàng lọc. Xem trên browser nhanh
                                      hơn download.

  Use Case nguồn                      UC-04

  Mức ưu tiên                         Cao

  Tiêu chí chấp nhận                  AC-1: Given Recruiter click tên ứng
                                      viên, Then hiển thị trang chi tiết
                                      với thông tin và CV viewer.\
                                      \
                                      AC-2: Given CV là PDF, When trang
                                      load, Then hiển thị PDF trực tiếp
                                      trong 2 giây.\
                                      \
                                      AC-3: Given CV là DOC/DOCX, When
                                      trang load, Then convert PDF và
                                      hiển thị trong 3 giây.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-009
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải cho phép Recruiter
                                      đánh dấu hồ sơ \"Shortlisted\" để
                                      chuyển vào danh sách phỏng vấn.

  Lý do (Rationale)                   Phân loại rõ ứng viên tiềm năng để
                                      tập trung sắp xếp phỏng vấn, tránh
                                      xem lại hồ sơ đã sàng lọc.

  Use Case nguồn                      UC-04

  Mức ưu tiên                         Cao

  Tiêu chí chấp nhận                  AC-1: Given xem hồ sơ
                                      status=\"New\", When nhấn
                                      \"Duyệt\", Then cập nhật
                                      status=\"Shortlisted\" và chuyển
                                      sang tab \"Đã chọn\".\
                                      \
                                      AC-2: Given hồ sơ Shortlisted, When
                                      vào tab \"Đã chọn\", Then hiển thị
                                      tất cả hồ sơ
                                      status=\"Shortlisted\".
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-010
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải cho phép Recruiter
                                      loại hồ sơ (\"Rejected\") và tự
                                      động gửi email từ chối.

  Lý do (Rationale)                   Tôn trọng ứng viên bằng thông báo
                                      sớm để họ tìm cơ hội khác. Tự động
                                      hóa tiết kiệm thời gian.

  Use Case nguồn                      UC-04

  Mức ưu tiên                         Cao

  Tiêu chí chấp nhận                  AC-1: Given xem hồ sơ, When nhấn
                                      \"Loại\", Then cập nhật
                                      status=\"Rejected\" và gửi email từ
                                      chối trong 1 phút.\
                                      \
                                      AC-2: Given hồ sơ Rejected, When
                                      xem danh sách, Then không hiển thị
                                      trong tab \"Mới\"/\"Đã chọn\", chỉ
                                      hiển thị tab \"Đã loại\".
  -----------------------------------------------------------------------

# 4. QUẢN LÝ PHỎNG VẤN

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-011
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải kiểm tra xung đột
                                      lịch phỏng vấn khi Recruiter tạo
                                      lịch mới cho Hiring Manager.

  Lý do (Rationale)                   Tránh một HM bị đặt 2 lịch trùng
                                      giờ, đảm bảo lịch làm việc hợp lý
                                      và chuyên nghiệp.

  Use Case nguồn                      UC-05

  Mức ưu tiên                         Cao

  Tiêu chí chấp nhận                  AC-1: Given HM A có lịch 9h, When
                                      đặt lịch mới cho HM A lúc 9h cùng
                                      ngày, Then cảnh báo \"Trùng lịch.
                                      HM đã có lịch PV vào giờ này.\"\
                                      \
                                      AC-2: Given không xung đột, When
                                      nhập đủ thông tin và \"Đặt lịch\",
                                      Then tạo bản ghi lịch PV thành
                                      công.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-012
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải tự động gửi email mời
                                      PV cho ứng viên và email thông báo
                                      cho HM sau khi lịch được tạo.

  Lý do (Rationale)                   Thông báo kịp thời cho cả hai bên
                                      chuẩn bị, tạo trải nghiệm chuyên
                                      nghiệp, giảm tỷ lệ no-show.

  Use Case nguồn                      UC-05

  Mức ưu tiên                         Cao

  Tiêu chí chấp nhận                  AC-1: Given lịch PV tạo thành công,
                                      When lưu bản ghi, Then gửi email
                                      mời ứng viên trong 1 phút.\
                                      \
                                      AC-2: Given lịch PV tạo thành công,
                                      When lưu bản ghi, Then gửi email
                                      thông báo HM trong 1 phút.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-013
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải cho phép ứng viên xác
                                      nhận hoặc từ chối PV qua link trong
                                      email.

  Lý do (Rationale)                   Xác nhận giúp Recruiter biết chắc
                                      ứng viên sẽ tham gia, tránh lãng
                                      phí thời gian chuẩn bị và chờ.

  Use Case nguồn                      UC-06

  Mức ưu tiên                         Cao

  Tiêu chí chấp nhận                  AC-1: Given nhận email mời, When
                                      click \"Xác nhận tham gia\", Then
                                      cập nhật status=\"Confirmed\", gửi
                                      email thông báo Recruiter.\
                                      \
                                      AC-2: Given nhận email, When click
                                      \"Từ chối\", Then cập nhật
                                      status=\"Declined\", gửi email
                                      Recruiter để sắp xếp lại.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-014
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải cho phép HM nhập điểm
                                      (kỹ năng chuyên môn, mềm, thái độ)
                                      và chọn Đạt/Không đạt sau PV.

  Lý do (Rationale)                   Ghi nhận đánh giá khách quan, có số
                                      liệu so sánh ứng viên và làm căn cứ
                                      quyết định tuyển dụng.

  Use Case nguồn                      UC-07

  Mức ưu tiên                         Cao

  Tiêu chí chấp nhận                  AC-1: Given PV đã diễn ra, When HM
                                      vào form đánh giá, Then hiển thị CV
                                      và form nhập điểm 3 tiêu chí + nhận
                                      xét.\
                                      \
                                      AC-2: Given HM nhập đủ và chọn
                                      \"Đạt\", When gửi, Then lưu đánh
                                      giá, cập nhật status=\"Interview
                                      Passed\", cho phép tạo Offer.\
                                      \
                                      AC-3: Given chọn \"Không đạt\",
                                      When gửi, Then status=\"Interview
                                      Failed\", không thể tạo Offer.
  -----------------------------------------------------------------------

# 5. QUẢN LÝ ĐỀ XUẤT (OFFER)

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-015
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải cho phép Recruiter
                                      tạo Offer (lương, phụ cấp, ngày bắt
                                      đầu) chỉ khi ứng viên \"Interview
                                      Passed\".

  Lý do (Rationale)                   Đảm bảo quy trình tuân thủ, chỉ ứng
                                      viên đạt yêu cầu mới được đề xuất
                                      tuyển dụng.

  Use Case nguồn                      UC-08

  Mức ưu tiên                         Cao

  Tiêu chí chấp nhận                  AC-1: Given ứng viên
                                      status=\"Interview Passed\", When
                                      nhập đủ thông tin Offer và \"Gửi
                                      duyệt\", Then tạo Offer
                                      status=\"Pending Approval\", chuyển
                                      Director.\
                                      \
                                      AC-2: Given ứng viên không
                                      \"Interview Passed\", When cố tạo
                                      Offer, Then báo lỗi \"Ứng viên chưa
                                      đạt phỏng vấn. Không thể tạo
                                      Offer.\"
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-016
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải cho phép Director phê
                                      duyệt hoặc từ chối Offer đang chờ
                                      duyệt.

  Lý do (Rationale)                   Quyết định cuối cùng về tuyển dụng
                                      thuộc cấp lãnh đạo để kiểm soát
                                      ngân sách và chất lượng nhân sự.

  Use Case nguồn                      UC-09

  Mức ưu tiên                         Cao

  Tiêu chí chấp nhận                  AC-1: Given Offer Pending Approval,
                                      When Director xem chi tiết và nhấn
                                      \"Duyệt\", Then cập nhật
                                      status=\"Approved\", gửi thư mời
                                      ứng viên.\
                                      \
                                      AC-2: Given Offer Pending, When
                                      Director nhấn \"Từ chối\" và nhập
                                      lý do, Then trả về Recruiter với
                                      comment của Director.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-017
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải tự động gửi email thư
                                      mời nhận việc khi Director phê
                                      duyệt Offer.

  Lý do (Rationale)                   Gửi thư mời ngay sau phê duyệt để
                                      ứng viên sớm nhận được thông tin và
                                      quyết định.

  Use Case nguồn                      UC-09

  Mức ưu tiên                         Cao

  Tiêu chí chấp nhận                  AC-1: Given Director duyệt Offer,
                                      When cập nhật status=\"Approved\",
                                      Then tạo email với đầy đủ điều
                                      khoản, gửi ứng viên kèm link phản
                                      hồi.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-018
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải cho phép ứng viên
                                      chấp nhận hoặc từ chối Offer qua
                                      link email.

  Lý do (Rationale)                   Cho phép ứng viên phản hồi dễ dàng,
                                      Recruiter biết kết quả nhanh để có
                                      kế hoạch backup nếu cần.

  Use Case nguồn                      UC-10

  Mức ưu tiên                         Cao

  Tiêu chí chấp nhận                  AC-1: Given nhận email Offer, When
                                      click \"Chấp nhận\", Then cập nhật
                                      status ứng viên=\"Hired\", khởi
                                      động quy trình tạo tài khoản.\
                                      \
                                      AC-2: Given nhận email Offer, When
                                      click \"Từ chối\" và nhập lý do,
                                      Then cập nhật Offer
                                      status=\"Declined\", thông báo
                                      Recruiter.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-019
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải tự động tạo tài khoản
                                      (email làm username, mật khẩu ngẫu
                                      nhiên, role=\"Probationer\") khi
                                      ứng viên chấp nhận Offer.

  Lý do (Rationale)                   Tự động hóa quy trình onboarding,
                                      chuẩn bị tài khoản để nhân viên mới
                                      truy cập từ ngày đầu làm việc.

  Use Case nguồn                      UC-10

  Mức ưu tiên                         Cao

  Tiêu chí chấp nhận                  AC-1: Given ứng viên chấp nhận
                                      Offer, When status=\"Hired\", Then
                                      tạo tài khoản (email=username,
                                      password random,
                                      role=\"Probationer\"), gửi email
                                      thông tin đăng nhập.\
                                      \
                                      AC-2: Given tạo tài khoản, When
                                      sinh password, Then đảm bảo
                                      password đạt yêu cầu bảo mật (≥12
                                      ký tự, hỗn hợp).
  -----------------------------------------------------------------------

# 6. QUẢN LÝ THỬ VIỆC

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-020
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải hiển thị danh sách
                                      nhân viên thử việc với tên, phòng
                                      ban, ngày bắt đầu, kết thúc, số
                                      ngày còn lại.

  Lý do (Rationale)                   Recruiter cần theo dõi tổng quan
                                      tình trạng thử việc để nhắc nhở
                                      đánh giá đúng hạn.

  Use Case nguồn                      UC-11

  Mức ưu tiên                         Cao

  Tiêu chí chấp nhận                  AC-1: Given Recruiter vào \"Quản lý
                                      thử việc\", When trang load, Then
                                      hiển thị bảng probationers với tên,
                                      phòng ban, ngày bắt đầu/kết thúc,
                                      số ngày còn lại.\
                                      \
                                      AC-2: Given Recruiter lọc theo
                                      phòng ban/status, When áp dụng
                                      filter, Then cập nhật hiển thị chỉ
                                      bản ghi phù hợp.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-021
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải cho phép Recruiter
                                      xuất danh sách thử việc sang Excel.

  Lý do (Rationale)                   Hỗ trợ phân tích, báo cáo cho Ban
                                      Giám đốc hoặc chia sẻ với các phòng
                                      ban liên quan.

  Use Case nguồn                      UC-11

  Mức ưu tiên                         Trung bình

  Tiêu chí chấp nhận                  AC-1: Given danh sách hiển thị,
                                      When nhấn \"Xuất Excel\", Then tạo
                                      file Excel với tất cả bản ghi và
                                      cột, khởi động download.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-022
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải tự động gửi email
                                      nhắc nhở HM đánh giá 7 ngày trước
                                      khi nhân viên hết hạn thử việc.

  Lý do (Rationale)                   Đảm bảo HM có đủ thời gian đánh
                                      giá, tránh quên hạn dẫn đến kéo dài
                                      thử việc hoặc quyết định vội vàng.

  Use Case nguồn                      UC-12

  Mức ưu tiên                         Cao

  Tiêu chí chấp nhận                  AC-1: Given scheduled job chạy,
                                      When probationer còn 7 ngày, Then
                                      gửi email nhắc HM, CC Recruiter.\
                                      \
                                      AC-2: Given đã nhắc 7 ngày, When HM
                                      chưa nộp đánh giá và còn 3 ngày,
                                      Then gửi email follow-up.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-023
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải cho phép HM nhập đánh
                                      giá thử việc (điểm KPI, nhận xét,
                                      đề xuất Ký HĐ chính thức/Chấm dứt).

  Lý do (Rationale)                   Ghi nhận đánh giá hiệu suất thử
                                      việc làm cơ sở quyết định ký HĐ
                                      chính thức hoặc chấm dứt.

  Use Case nguồn                      UC-13

  Mức ưu tiên                         Cao

  Tiêu chí chấp nhận                  AC-1: Given HM nhận reminder, When
                                      vào form đánh giá, Then hiển thị
                                      thông tin probationer, form điểm
                                      KPI, nhận xét, đề xuất.\
                                      \
                                      AC-2: Given HM hoàn thành đánh giá,
                                      When nhấn \"Gửi duyệt\", Then lưu,
                                      cập nhật status=\"Pending Director
                                      Approval\", route đến Director.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-024
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải cho phép Director phê
                                      duyệt hoặc từ chối kết quả đánh giá
                                      thử việc.

  Lý do (Rationale)                   Quyết định cuối cùng về chuyển
                                      chính thức/chấm dứt thuộc Director
                                      để đảm bảo chất lượng nhân sự.

  Use Case nguồn                      UC-14

  Mức ưu tiên                         Cao

  Tiêu chí chấp nhận                  AC-1: Given đánh giá Pending
                                      Approval, When Director xem và nhấn
                                      \"Phê duyệt\", Then cập nhật status
                                      nhân viên (Chính thức/Đã nghỉ việc
                                      tùy đề xuất), gửi email thông báo
                                      nhân viên.\
                                      \
                                      AC-2: Given Pending Approval, When
                                      Director \"Từ chối\" và nhập lý do,
                                      Then trả đánh giá về HM với comment
                                      Director.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-025
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải tự động gửi email
                                      thông báo kết quả thử việc cho nhân
                                      viên sau khi Director phê duyệt.

  Lý do (Rationale)                   Nhân viên cần biết kết quả sớm để
                                      an tâm hoặc có kế hoạch tìm việc
                                      khác.

  Use Case nguồn                      UC-14

  Mức ưu tiên                         Cao

  Tiêu chí chấp nhận                  AC-1: Given Director phê duyệt đánh
                                      giá, When cập nhật status nhân
                                      viên, Then gửi email thông báo kết
                                      quả và các bước tiếp theo.
  -----------------------------------------------------------------------

# 7. TỰ PHỤC VỤ NHÂN VIÊN THỬ VIỆC

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-026
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải cho phép Probationer
                                      xem thông tin thử việc (ngày bắt
                                      đầu/kết thúc, supervisor, kết quả
                                      đánh giá) ở chế độ chỉ đọc.

  Lý do (Rationale)                   Minh bạch thông tin giúp nhân viên
                                      thử việc nắm được lộ trình và tự
                                      theo dõi tiến độ.

  Use Case nguồn                      UC-17

  Mức ưu tiên                         Trung bình

  Tiêu chí chấp nhận                  AC-1: Given Probationer đăng nhập,
                                      When vào \"Thông tin thử việc\",
                                      Then hiển thị chế độ chỉ đọc:
                                      timeline, supervisor, status đánh
                                      giá.\
                                      \
                                      AC-2: Given đánh giá hoàn thành và
                                      duyệt, When vào trang, Then hiển
                                      thị kết quả cuối (Đạt/Không đạt) và
                                      status (Chính thức/Chấm dứt).\
                                      \
                                      AC-3: Given đánh giá chưa hoàn
                                      thành, When vào trang, Then hiển
                                      thị \"Đang chờ đánh giá\".
  -----------------------------------------------------------------------

# 8. BÁO CÁO

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-027
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải cung cấp dashboard
                                      báo cáo tuyển dụng cho Recruiter
                                      (tổng hồ sơ, theo nguồn, lịch PV,
                                      Offer, tỷ lệ chấp nhận).

  Lý do (Rationale)                   Số liệu giúp Recruiter đánh giá
                                      hiệu quả kênh tuyển dụng, tối ưu
                                      quy trình và nguồn lực.

  Use Case nguồn                      UC-15

  Mức ưu tiên                         Trung bình

  Tiêu chí chấp nhận                  AC-1: Given Recruiter vào \"Báo cáo
                                      tuyển dụng\", When trang load, Then
                                      hiển thị charts: tổng hồ sơ, theo
                                      nguồn, lịch PV đã đặt, Offer đưa
                                      ra, tỷ lệ chấp nhận.\
                                      \
                                      AC-2: Given chọn khoảng thời gian,
                                      When áp filter, Then cập nhật tất
                                      cả metrics theo khoảng thời gian đã
                                      chọn.\
                                      \
                                      AC-3: Given nhấn \"Xuất báo cáo\",
                                      When khởi động export, Then tạo
                                      file PDF/Excel với metrics hiển
                                      thị.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Mã yêu cầu                          REQ-028
  ----------------------------------- -----------------------------------
  Yêu cầu (Statement)                 Hệ thống phải cung cấp dashboard
                                      điều hành cho Director (biên chế
                                      theo phòng ban, ngân sách tuyển
                                      dụng, tỷ lệ nghỉ việc,
                                      time-to-fill).

  Lý do (Rationale)                   Director cần số liệu tổng quan để
                                      ra quyết định chiến lược về nhân sự
                                      và ngân sách.

  Use Case nguồn                      UC-16

  Mức ưu tiên                         Cao

  Tiêu chí chấp nhận                  AC-1: Given Director vào \"Báo cáo
                                      tổng hợp\", When dashboard load,
                                      Then hiển thị metrics: biên
                                      chế/phòng ban, budget spent vs
                                      allocated, turnover rate, avg
                                      time-to-fill.\
                                      \
                                      AC-2: Given Director click tên
                                      phòng ban, When drill-down, Then
                                      hiển thị metrics chi tiết phòng ban
                                      đó.\
                                      \
                                      AC-3: Given nhấn export, When khởi
                                      động, Then tạo PDF report đầy đủ
                                      với charts và data tables.
  -----------------------------------------------------------------------

# 9. MA TRẬN CRUD

  ---------------------------------------------------------------------------
  Thực thể        Create         Read           Update         Delete
  --------------- -------------- -------------- -------------- --------------
  User            REQ-019        REQ-002        \-             \-

  JobPosting      REQ-004        REQ-006        REQ-005        REQ-005

  Application     REQ-006        REQ-008        REQ-009,010    \-

  Interview       REQ-011        REQ-014        REQ-013        \-

  InterviewEval   REQ-014        REQ-014        \-             \-

  Offer           REQ-015        REQ-016        REQ-018        \-

  Probationer     REQ-019        REQ-020,026    REQ-024        \-

  ProbationEval   REQ-023        REQ-023        REQ-024        \-

  Report          \-             REQ-027,028    \-             \-
  ---------------------------------------------------------------------------

# 11. TỔNG HỢP

Tổng số yêu cầu chức năng: 28

Yêu cầu Cao: 23 (82%) \| Trung bình: 5 (18%)

Độ phủ Use Case: 17/17 (100%)

Độ phủ thực thể: 9/9 (100%)
