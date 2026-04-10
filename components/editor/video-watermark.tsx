"use client"

interface VideoWatermarkProps {
  userName?: string
}

export function VideoWatermark({ userName = "张三" }: VideoWatermarkProps) {
  // 生成水印文本（减少重复次数，让水印更疏松）
  const watermarkText = Array(30).fill(userName).join("     ") // 从50减到30，间距从3个空格增加到5个
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* 多行水印，斜向排列 - 减少行数，增加行间距 */}
      {Array.from({ length: 10 }).map((_, rowIndex) => ( // 从15行减到10行
        <div
          key={rowIndex}
          className="absolute whitespace-nowrap text-white/[0.08] font-medium select-none"
          style={{
            fontSize: "14px",
            top: `${rowIndex * 12}%`, // 从8%增加到12%，行间距更大
            left: rowIndex % 2 === 0 ? "-10%" : "5%", // 调整左偏移
            transform: "rotate(-15deg)",
            transformOrigin: "left top",
            width: "150%",
            letterSpacing: "0.8em", // 从0.5em增加到0.8em，字间距更大
          }}
        >
          {watermarkText}
        </div>
      ))}
    </div>
  )
}
