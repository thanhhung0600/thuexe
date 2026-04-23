import { NextResponse } from 'next/server';
import { google } from "googleapis";

export async function GET(request) {
  // Lấy các tham số từ URL (VD: ?type=xe&q=Toyota)
  const { searchParams } = new URL(request.url);
  const searchType = searchParams.get("type");
  const query = searchParams.get("q")?.toLowerCase().trim() || "";

  // Nếu người dùng không nhập gì, trả về mảng rỗng luôn cho nhẹ server
  if (!query) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "DATA!A2:I", // Lấy từ cột A đến Cột I (Ghi chú)
    });

    const rows = response.data.values || [];

    // 1. LỌC DỮ LIỆU TÌM KIẾM
    const filteredRows = rows.filter(row => {
      let targetColumnValue = "";
      
      // Map đúng vị trí cột trên Google Sheet của bạn
      // Cột E (index 4) là Tên Xe
      if (searchType === "xe") targetColumnValue = row[4] || "";
      // Cột F (index 5) là Tài xế
      else if (searchType === "taixe") targetColumnValue = row[5] || "";
      // Cột I (index 8) là Ghi chú (dùng để tìm Địa điểm)
      else if (searchType === "diadiem") targetColumnValue = row[8] || "";
      
      // Kiểm tra xem dữ liệu trong ô có chứa từ khóa không (không phân biệt hoa/thường)
      return targetColumnValue.toLowerCase().includes(query);
    });

    // 2. CHUẨN HÓA DỮ LIỆU ĐỂ HIỂN THỊ LÊN CARD (LichTrinhChiTiet)
    const formattedData = filteredRows.map((row) => ({
      ngày: row[0] || "",
      thu: row[1] || "",
      tenKhach: row[2] || "",
      // Xóa dấu nháy đơn (') ở đầu SĐT mà lúc đặt lịch chúng ta đã thêm vào để tránh lỗi Sheet
      sdt: row[3] ? row[3].replace(/^'/, '') : "", 
      label: row[4] || "", // Đây là Tên Xe hiển thị trên Card
      taiXe: row[5] || "",
      time: row[6] ? row[6].replace(/^'/, '') : "", // Xóa dấu nháy đơn (') ở giờ
      gia: row[7] || "",
      ghiChu: row[8] || ""
    }));

    // 3. ĐẢO NGƯỢC MẢNG (Hiển thị các chuyến đi mới nhất - tức là ở dưới cùng của Sheet - lên đầu tiên)
    formattedData.reverse();

    return NextResponse.json({ success: true, data: formattedData });

  } catch (error) {
    console.error("Lỗi API Tìm kiếm:", error.message);
    return NextResponse.json({ success: false, error: "Không thể kết nối đến máy chủ" }, { status: 500 });
  }
}