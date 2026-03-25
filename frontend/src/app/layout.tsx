import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pinnacle - 战报配置平台",
  description: "可视化配置战报模板，三方API调用，钉钉机器人推送",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
