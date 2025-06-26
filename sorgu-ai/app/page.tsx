"use client"

import type React from "react"

import { useState } from "react"
import { Search, Loader2, AlertCircle, Brain, Phone, Users, Car, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface ApiResponse {
  [key: string]: any
}

interface QueryResult {
  type: string
  data: ApiResponse
  apiUsed: string
  query: string
}

export default function SorguAI() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<QueryResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getQueryTypeIcon = (type: string) => {
    switch (type) {
      case "tc":
        return <Users className="h-4 w-4" />
      case "gsm":
        return <Phone className="h-4 w-4" />
      case "plaka":
        return <Car className="h-4 w-4" />
      case "ad_soyad":
        return <Users className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const getQueryTypeColor = (type: string) => {
    switch (type) {
      case "tc":
        return "bg-blue-100 text-blue-800"
      case "gsm":
        return "bg-green-100 text-green-800"
      case "plaka":
        return "bg-purple-100 text-purple-800"
      case "ad_soyad":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleSmartSearch = async () => {
    if (!query.trim()) {
      setError("Lütfen bir arama terimi girin")
      return
    }

    setLoading(true)
    setError(null)
    setResults([])

    try {
      const response = await fetch("/api/smart-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query.trim() }),
      })

      if (!response.ok) {
        throw new Error("Arama sırasında bir hata oluştu")
      }

      const data = await response.json()
      setResults(data.results || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSmartSearch()
    }
  }

  const renderResults = () => {
    if (results.length === 0) return null

    return (
      <div className="space-y-6">
        {results.map((result, index) => (
          <Card key={index} className="border-l-4 border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getQueryTypeIcon(result.type)}
                  <span className="capitalize">{result.type.replace(/_/g, " ")} Sorgusu</span>
                </div>
                <Badge className={getQueryTypeColor(result.type)}>{result.apiUsed}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Sorgu: </span>
                  <span className="text-sm text-gray-900">{result.query}</span>
                </div>

                {typeof result.data === "object" && result.data !== null ? (
                  <div className="space-y-3">
                    {Object.entries(result.data).map(([key, value], idx) => (
                      <div key={idx} className="border-l-2 border-gray-200 pl-4">
                        <div className="font-medium text-gray-700 capitalize text-sm">
                          {key.replace(/_/g, " ").replace(/tc/gi, "TC").replace(/gsm/gi, "GSM")}
                        </div>
                        <div className="text-gray-900 mt-1">
                          {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Akıllı Sorgu AI</h1>
          </div>
          <p className="text-gray-600">Ne yazarsanız yazın, otomatik olarak doğru sorguyu yaparım!</p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="TC, GSM, Plaka, Ad Soyad... Ne isterseniz yazın!"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-lg"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    TC: 11111111110
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Phone className="h-3 w-3 mr-1" />
                    GSM: 5551234567
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Car className="h-3 w-3 mr-1" />
                    Plaka: 34ABC123
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    Ad Soyad: Ahmet Yılmaz
                  </Badge>
                </div>
              </div>
              <Button onClick={handleSmartSearch} disabled={loading} className="px-8">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                {loading ? "Analiz Ediliyor..." : "Akıllı Arama"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Sorgunuz analiz ediliyor...</p>
                  <p className="text-sm text-gray-500 mt-2">Uygun API'ler belirleniyor ve sorgular yapılıyor</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {renderResults()}

        {!loading && results.length === 0 && !error && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Akıllı Sorgu Sistemi</h3>
                <p className="mb-4">Ne yazarsanız yazın, otomatik olarak uygun sorguları yaparım!</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 text-left">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600 mb-2" />
                    <h4 className="font-medium text-blue-900">TC Sorguları</h4>
                    <p className="text-sm text-blue-700">TC, Adres, Aile, Sülale, İş Yeri</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <Phone className="h-6 w-6 text-green-600 mb-2" />
                    <h4 className="font-medium text-green-900">GSM Sorguları</h4>
                    <p className="text-sm text-green-700">GSM-TC, Operatör Bilgileri</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <Car className="h-6 w-6 text-purple-600 mb-2" />
                    <h4 className="font-medium text-purple-900">Araç Sorguları</h4>
                    <p className="text-sm text-purple-700">Plaka, Tapu Bilgileri</p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <Building className="h-6 w-6 text-orange-600 mb-2" />
                    <h4 className="font-medium text-orange-900">Diğer Sorgular</h4>
                    <p className="text-sm text-orange-700">Ad-Soyad, Hane, Hayat Hikayesi</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
