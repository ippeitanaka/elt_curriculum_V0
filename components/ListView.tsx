"use client"

import { useMemo } from "react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

const shortenDayOfWeek = (day: string): string => {
  const shortDays: { [key: string]: string } = {
    月曜日: "月",
    火曜日: "火",
    水曜日: "水",
    木曜日: "木",
    金曜日: "金",
    土曜日: "土",
    日曜日: "日",
  }
  return shortDays[day] || day
}

export default function ListView({ data, filter, selectedInstructor, showExamsOnly }) {
  const sortedData = useMemo(() => {
    // データが null または空の場合は空の配列を返す
    if (!data || data.length === 0) return []

    return [...data]
      .filter((item) => item) // null チェック
      .sort((a, b) => {
        if (!a.日付 || !b.日付) return 0

        const dateA = new Date(a.日付)
        const dateB = new Date(b.日付)
        if (dateA.getTime() !== dateB.getTime()) return dateA.getTime() - dateB.getTime()
        return a.時限?.localeCompare(b.時限 || "") || 0
      })
      .filter((item) => {
        if (showExamsOnly) {
          const year = item.filteredYear || filter.year
          const cls = item.filteredClass || filter.class

          // コマ数に「試験」または「模試」が含まれる場合
          const periods = item[`${year}年${cls}クラスコマ数`] || ""
          return periods.includes("試験") || periods.includes("模試")
        }
        return true
      })
  }, [data, filter.year, filter.class, showExamsOnly])

  let currentDate = null

  // データがない場合のメッセージ
  if (sortedData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <p className="text-gray-500">表示するデータがありません</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-100 text-gray-600 uppercase text-[0.5rem] sm:text-[0.65rem] leading-normal">
            <th className="py-1 sm:py-2 px-1 sm:px-3 text-left w-14 sm:w-20">日付</th>
            <th className="py-1 sm:py-2 px-1 sm:px-2 text-left w-6 sm:w-8">曜日</th>
            <th className="py-1 sm:py-2 px-1 sm:px-2 text-left w-6 sm:w-8">時限</th>
            <th className="py-1 sm:py-2 px-1 sm:px-3 text-left w-32 sm:w-48">授業内容</th>
            <th className="py-1 sm:py-2 px-1 sm:px-3 text-left w-14 sm:w-20">担当講師</th>
            <th className="py-1 sm:py-2 px-1 sm:px-2 text-left w-14 sm:w-16">コマ数</th>
            <th className="py-1 sm:py-2 px-1 sm:px-2 text-left w-20 sm:w-28">学年・クラス</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-[0.6rem] sm:text-xs">
          {sortedData.map((item, index) => {
            if (!item || !item.日付) return null // 無効なデータをスキップ

            const date = new Date(item.日付)
            const formattedDate = format(date, "M月d日", { locale: ja })
            const isNewDate = currentDate !== item.日付
            if (isNewDate) {
              currentDate = item.日付
            }

            const year = item.filteredYear || filter.year
            const cls = item.filteredClass || filter.class

            const content = item[`${year}年${cls}クラスの授業内容`]
            const periods = item[`${year}年${cls}クラスコマ数`] || ""

            if (!content && !periods) return null

            const isExam = periods.includes("試験")
            const isMockExam = periods.includes("模試")
            const isSelfStudy = content === "自宅学習"

            return (
              <tr
                key={`${index}-${year}-${cls}`}
                className={`
                  ${isExam ? "bg-red-100 hover:bg-red-200" : ""}
                  ${isMockExam && !isExam ? "bg-orange-100 hover:bg-orange-200" : ""}
                  ${isSelfStudy && !isExam && !isMockExam ? "bg-sky-100 hover:bg-sky-200" : ""}
                  ${!isExam && !isMockExam && !isSelfStudy ? "hover:bg-gray-50" : ""}
                  ${isNewDate ? "border-t border-gray-300" : ""}
                `}
              >
                <td className="py-1 px-1 sm:px-3 text-left whitespace-nowrap">{formattedDate}</td>
                <td className="py-1 px-1 sm:px-2 text-left">{shortenDayOfWeek(item.曜日 || "")}</td>
                <td className="py-1 px-1 sm:px-2 text-left">{item.時限}</td>
                <td className="py-1 px-1 sm:px-3 text-left">{content}</td>
                <td className="py-1 px-1 sm:px-3 text-left">{item[`${year}年${cls}クラス担当講師名`]}</td>
                <td className="py-1 px-1 sm:px-2 text-left">{periods}</td>
                <td className="py-1 px-1 sm:px-2 text-left">{`${year}年${cls}クラス`}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
