import { NextResponse } from 'next/server';
import { google } from "googleapis";

export async function POST(request) {
  try {
    const body = await request.json();

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // CÁCH XỬ LÝ: Thêm dấu nháy đơn (') vào trước SĐT và Giờ
    const formatSdt = body.soDienThoai ? `'${body.soDienThoai}` : "";
    const formatGio = body.gio ? `'${body.gio}` : "";

    const rowData = [
      body.ngay || "",                 // Cột A
      body.thu || "",                  // Cột B
      body.tenKhachHang || "",         // Cột C
      formatSdt,                       // Cột D (Đã thêm dấu ')
      body.loaiXe || "",               // Cột E
      body.taiXe || "",                // Cột F
      formatGio,                       // Cột G (Đã thêm dấu ')
      body.gia || "",                  // Cột H
      body.ghiChu || "",               // Cột I
      new Date().toLocaleString("vi-VN")// Cột J
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "DATA!A:J",
      // Giữ nguyên USER_ENTERED, dấu ' sẽ tự động kích hoạt tính năng chuyển thành Text
      valueInputOption: "USER_ENTERED", 
      requestBody: {
        values: [rowData],
      },
    });

    return NextResponse.json({ success: true, message: "Đặt lịch thành công!" });

  } catch (error) {
    console.error("Lỗi tại API lưu dữ liệu:", error.message);
    return NextResponse.json({ success: false, error: "Không thể kết nối đến máy chủ lưu trữ" }, { status: 500 });
  }
}