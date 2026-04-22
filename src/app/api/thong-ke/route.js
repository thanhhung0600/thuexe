import { google } from "googleapis";

export async function GET(request) {
  try {
    // 1. Lấy và kiểm tra tham số đầu vào
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month"));
    const year = parseInt(searchParams.get("year"));

    if (!month || !year) {
      return Response.json({ success: false, error: "Tham số không hợp lệ" }, { status: 400 });
    }

    // 2. Thiết lập kết nối Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    
    // 3. Truy xuất dữ liệu từ Sheet "DATA"
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "DATA!A2:E", // Chỉ lấy đến cột E để tối ưu dung lượng tải
    });

    const rows = response.data.values || [];
    
    // 4. Khởi tạo bộ đếm (Key phải khớp 100% với tên xe trong Sheet)
    const counts = {
      "Xe 4 (Thái)": 0,
      "Xe 4 (Học)": 0,
      "Xe 7 (Mitsubishi)": 0,
      "Xe 8 (Toyota)": 0
    };

    // 5. Thuật toán đếm tối ưu
    rows.forEach(row => {
      const dateStr = row[0]; // Cột A
      const carType = row[4]; // Cột E

      if (dateStr && carType) {
        // Chuẩn hóa ngày tháng (Xử lý cả dấu / và dấu -)
        const formattedDate = dateStr.includes('/') ? dateStr.split('/').reverse().join('-') : dateStr;
        const d = new Date(formattedDate);
        
        if (!isNaN(d.getTime())) {
          if ((d.getMonth() + 1) === month && d.getFullYear() === year) {
            const cleanType = carType.trim();
            if (counts.hasOwnProperty(cleanType)) {
              counts[cleanType]++;
            }
          }
        }
      }
    });

    // 6. Tính toán tỷ lệ hiển thị
    const maxVal = Math.max(...Object.values(counts), 1);

    const stats = Object.keys(counts).map((key, index) => ({
      id: index + 1,
      label: key.replace("Mitsubishi", "Mit").replace("Toyota", "Toy"), // Rút gọn label hiển thị
      count: counts[key],
      height: `${(counts[key] / maxVal) * 100}%`,
      // Gán màu cố định cho từng loại xe
      color: key.includes("4") ? (key.includes("Thái") ? "bg-blue-400" : "bg-indigo-400") : (key.includes("7") ? "bg-teal-400" : "bg-emerald-400")
    }));

    return Response.json({ success: true, data: stats });

  } catch (error) {
    console.error("API Error:", error.message);
    return Response.json({ success: false, error: "Lỗi kết nối dữ liệu" }, { status: 500 });
  }
}