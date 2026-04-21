import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();

    // ⚠️ QUAN TRỌNG: Dán link Web App URL (kết thúc bằng /exec) của bạn vào đây
    const GOOGLE_URL = "https://script.google.com/macros/s/AKfycbyuH92oNRqbSdhx-EgCRccEEiS7Dedsm3h0zlmaNndIJq3NB2hReT8ZbU_KrYlYHQqm/exec";

    console.log("Đang chuyển dữ liệu sang Google:", body);

    const res = await fetch(GOOGLE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const result = await res.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Lỗi tại API nội bộ:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}