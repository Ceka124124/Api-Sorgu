import { type NextRequest, NextResponse } from "next/server"

interface ApiEndpoint {
  url: string
  name: string
  type: string
}

const API_ENDPOINTS: Record<string, ApiEndpoint[]> = {
  tc: [
    { url: "http://api.ondex.uk/ondexapi/tcsorgu.php?tc=", name: "TC Sorgu", type: "tc" },
    { url: "http://api.ondex.uk/ondexapi/tcprosorgu.php?tc=", name: "TC Pro Sorgu", type: "tc" },
    { url: "http://api.ondex.uk/ondexapi/adressorgu.php?tc=", name: "Adres Sorgu", type: "tc" },
    { url: "https://e51b-85-95-251-234.ngrok-free.app/hane.php?tc=", name: "Hane Sorgu", type: "tc" },
    { url: "http://api.ondex.uk/ondexapi/ailesorgu.php?tc=", name: "Aile Sorgu", type: "tc" },
    { url: "http://api.ondex.uk/ondexapi/tcgsmsorgu.php?tc=", name: "TC-GSM Sorgu", type: "tc" },
    { url: "http://api.ondex.uk/ondexapi/tcgsmprosorgu.php?tc=", name: "TC-GSM Pro Sorgu", type: "tc" },
    { url: "http://api.ondex.uk/ondexapi/sulalesorgu.php?tc=", name: "Sülale Sorgu", type: "tc" },
    { url: "http://api.ondex.uk/ondexapi/sulaleprosorgu.php?tc=", name: "Sülale Pro Sorgu", type: "tc" },
    { url: "http://api.ondex.uk/ondexapi/hayathikayesisorgu.php?tc=", name: "Hayat Hikayesi", type: "tc" },
    { url: "http://api.ondex.uk/ondexapi/isyerisorgu.php?tc=", name: "İş Yeri Sorgu", type: "tc" },
    { url: "http://api.ondex.uk/ondexapi/isyeriarkadasisorgu.php?tc=", name: "İş Arkadaşı Sorgu", type: "tc" },
    { url: "http://api.ondex.uk/ondexapi/isyeriyetkilisorgu.php?tc=", name: "İş Yeri Yetkili", type: "tc" },
    { url: "https://e51b-85-95-251-234.ngrok-free.app/tapu.php?tc=", name: "Tapu Sorgu", type: "tc" },
  ],
  gsm: [
    { url: "http://api.ondex.uk/ondexapi/gsmtcsorgu.php?gsm=", name: "GSM-TC Sorgu", type: "gsm" },
    { url: "http://api.ondex.uk/ondexapi/gsmtcprosorgu.php?gsm=", name: "GSM-TC Pro Sorgu", type: "gsm" },
    { url: "http://api.ondex.uk/ondexapi/operator.php?gsm=", name: "Operatör Sorgu", type: "gsm" },
  ],
  plaka: [{ url: "https://e51b-85-95-251-234.ngrok-free.app/plaka.php?plaka=", name: "Plaka Sorgu", type: "plaka" }],
  ad_soyad: [
    {
      url: "http://api.ondex.uk/ondexapi/adsoyadsorgu.php?ad={ad}&soyad={soyad}&il=&ilce=",
      name: "Ad Soyad Sorgu",
      type: "ad_soyad",
    },
    {
      url: "http://api.ondex.uk/ondexapi/adsoyadprosorgu.php?ad={ad}&soyad={soyad}&il=&ilce=",
      name: "Ad Soyad Pro Sorgu",
      type: "ad_soyad",
    },
  ],
}

function detectQueryType(query: string): { type: string; cleanQuery: string; params?: any } {
  const cleanQuery = query.trim()

  // TC Kimlik No kontrolü (11 haneli sayı)
  if (/^\d{11}$/.test(cleanQuery)) {
    return { type: "tc", cleanQuery }
  }

  // GSM kontrolü (10-11 haneli, 5 ile başlayan)
  if (/^(5\d{9}|05\d{9})$/.test(cleanQuery.replace(/\s/g, ""))) {
    const gsm = cleanQuery.replace(/\s/g, "").replace(/^0/, "")
    return { type: "gsm", cleanQuery: gsm }
  }

  // Plaka kontrolü (2 rakam + 1-3 harf + 1-4 rakam formatı)
  if (/^\d{2}[A-Za-z]{1,3}\d{1,4}$/.test(cleanQuery.replace(/\s/g, ""))) {
    return { type: "plaka", cleanQuery: cleanQuery.replace(/\s/g, "").toUpperCase() }
  }

  // Ad Soyad kontrolü (en az 2 kelime, sadece harf ve boşluk)
  if (/^[A-Za-zÇĞıİÖŞÜçğıiöşü\s]{2,}$/.test(cleanQuery) && cleanQuery.includes(" ")) {
    const parts = cleanQuery.split(" ").filter((p) => p.length > 0)
    if (parts.length >= 2) {
      return {
        type: "ad_soyad",
        cleanQuery,
        params: { ad: parts[0], soyad: parts.slice(1).join(" ") },
      }
    }
  }

  // Varsayılan olarak TC sorgusu yap
  return { type: "tc", cleanQuery }
}

async function makeApiRequest(endpoint: ApiEndpoint, query: string, params?: any): Promise<any> {
  try {
    let url = endpoint.url

    if (endpoint.type === "ad_soyad" && params) {
      url = url.replace("{ad}", encodeURIComponent(params.ad))
      url = url.replace("{soyad}", encodeURIComponent(params.soyad))
    } else {
      const paramName = endpoint.type === "plaka" ? "plaka" : endpoint.type === "gsm" ? "gsm" : "tc"
      url += encodeURIComponent(query)
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "SorguAI-Smart/1.0",
        Accept: "application/json, text/plain, */*",
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const data = await response.text()

    try {
      return JSON.parse(data)
    } catch {
      return { result: data, raw_response: true }
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "API request failed", endpoint: endpoint.name }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Geçersiz sorgu" }, { status: 400 })
    }

    const detection = detectQueryType(query)
    const endpoints = API_ENDPOINTS[detection.type] || API_ENDPOINTS.tc

    // Paralel olarak tüm uygun API'leri çağır
    const promises = endpoints.map((endpoint) =>
      makeApiRequest(endpoint, detection.cleanQuery, detection.params)
        .then((data) => ({
          type: detection.type,
          data,
          apiUsed: endpoint.name,
          query: detection.cleanQuery,
          success: !data.error,
        }))
        .catch((error) => ({
          type: detection.type,
          data: { error: error.message },
          apiUsed: endpoint.name,
          query: detection.cleanQuery,
          success: false,
        })),
    )

    const results = await Promise.all(promises)

    // Başarılı sonuçları önce göster
    const sortedResults = results.sort((a, b) => {
      if (a.success && !b.success) return -1
      if (!a.success && b.success) return 1
      return 0
    })

    return NextResponse.json({
      detectedType: detection.type,
      originalQuery: query,
      cleanQuery: detection.cleanQuery,
      results: sortedResults,
    })
  } catch (error) {
    console.error("Smart Search Error:", error)
    return NextResponse.json({ error: "Akıllı arama sırasında hata oluştu" }, { status: 500 })
  }
}
