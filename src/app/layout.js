import "./globals.css";

export const metadata = {
  title: "Exabin - Your personal storage space",
  description: "One stop solution for your personal cloud storage needs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
