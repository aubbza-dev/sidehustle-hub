import "./globals.css";

export const metadata = {
  title: "sidehustle hub",
  description: "legit ways to make extra income online",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
