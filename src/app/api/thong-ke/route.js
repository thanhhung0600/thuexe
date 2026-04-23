import { google } from "googleapis";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetMonth = parseInt(searchParams.get("month"));
  const targetYear = parseInt(searchParams.get("year"));

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
      range: "DATA!A2:E", 
    });

    const rows = response.data.values || [];

    // --- LOGIC 1: THỐNG KÊ TỪNG XE (THÁNG HIỆN TẠI) ---
    // ✅ CỐ ĐỊNH 4 CỘT: Khởi tạo sẵn 4 xe dựa trên form đặt lịch của bạn
    // Tên trong ngoặc kép phải giống Y HỆT trong file Google Sheet
    const carStats = {
      "Xe 4 (Thái)": 0,
      "Xe 4 (Học)": 0,
      "Xe 7 (Mitsubishi)": 0,
      "Xe 8 (Toyota)": 0,
      "Xe Khác": 0
    };
    const colors = ["bg-blue-400", "bg-indigo-400", "bg-teal-400", "bg-emerald-400"];

    // --- LOGIC 2: THỐNG KÊ LỊCH SỬ 4 THÁNG ---
    const historyStats = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date(targetYear, targetMonth - 1 - i, 1);
      historyStats.push({
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        label: `Tháng ${d.getMonth() + 1}`,
        count: 0
      });
    }

    rows.forEach(row => {
      const dateStr = row[0];
      const carName = row[4];
      if (!dateStr) return;

      const [y, m] = dateStr.split("-").map(Number);

      // Tính cho biểu đồ 1
      if (y === targetYear && m === targetMonth && carName) {
        // Cộng dồn. Nếu xuất hiện xe lạ ngoài 4 xe trên, nó sẽ tự tạo thêm cột thứ 5
        carStats[carName] = (carStats[carName] || 0) + 1;
      }

      // Tính cho biểu đồ 2
      historyStats.forEach(h => {
        if (y === h.year && m === h.month) {
          h.count++;
        }
      });
    });

    // Định dạng dữ liệu trả về cho biểu đồ 1
    const carChartData = Object.keys(carStats).map((name, idx) => {
      // ✅ BÍ QUYẾT LÀM ĐẸP GIAO DIỆN:
      // Rút gọn tên xe để hiển thị dưới đáy cột không bị tràn chữ
      let shortName = name
        .replace("Xe 7 (Mitsubishi)", "XE 7 (MIT)")
        .replace("Xe 8 (Toyota)", "XE 8 (TOY)")
        .toUpperCase();
      
      return {
        id: idx,
        label: shortName,
        count: carStats[name],
        color: colors[idx % colors.length]
      };
    });

    // Định dạng dữ liệu cho biểu đồ 2
    const formattedHistory = historyStats.map((h, idx) => ({
      id: `h-${idx}`,
      label: h.label,
      count: h.count,
      color: "bg-slate-400"
    }));

    return Response.json({ 
      success: true, 
      data: carChartData, 
      history: formattedHistory 
    });

  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}