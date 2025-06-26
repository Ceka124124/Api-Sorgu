import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const tc = searchParams.get("tc")

  if (!tc) {
    return NextResponse.json({ error: "TC kimlik numarası gerekli" }, { status: 400 })
  }

  // TC format kontrolü
  if (tc.length !== 11 || !/^\d+$/.test(tc)) {
    return NextResponse.json({ error: "Geçersiz TC kimlik numarası formatı" }, { status: 400 })
  }

  try {
    // API'ye TC sorgusu gönder
    const apiUrl = `http://api.ondex.uk/ondexapi/tcsorgu.php?tc=${tc}`

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "User-Agent": "SorguAI-TC/1.0",
        Accept: "application/json, text/plain, */*",
      },
    })

    if (!response.ok) {
      throw new Error(`API hatası: ${response.status}`)
    }

    const data = await response.text()

    // JSON parse etmeye çalış
    try {
      const jsonData = JSON.parse(data)
      return NextResponse.json(jsonData)
    } catch {
      // JSON değilse text olarak döndür
      return NextResponse.json({
        tc_no: tc,
        result: data,
        message: "Sorgu tamamlandı",
      })
    }
  } catch (error) {
    console.error("TC API Error:", error)
    return NextResponse.json(
      {
        error: "TC sorgu API'sine erişim sırasında hata oluştu",
        tc_no: tc,
      },
      { status: 500 },
    )
  }
}
