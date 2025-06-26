import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Arama terimi gerekli" }, { status: 400 })
  }

  try {
    // API'ye istek gönder
    const apiUrl = `http://api.ondex.uk/ondexapi/tcsorgu.php?tc=${encodeURIComponent(query)}`

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "User-Agent": "SorguAI/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`API hatası: ${response.status}`)
    }

    const data = await response.text()

    // JSON parse etmeye çalış, başarısız olursa text olarak döndür
    try {
      const jsonData = JSON.parse(data)
      return NextResponse.json(jsonData)
    } catch {
      // JSON değilse text olarak döndür
      return NextResponse.json({ result: data })
    }
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "API'ye erişim sırasında hata oluştu" }, { status: 500 })
  }
}
