export const metadata = {
  title: "What is Ved doing?",
  description: "Ved's current status, from location and Sleep Focus.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif", background: "#0b1020", color: "#f2f4f8" }}>
        {children}
      </body>
    </html>
  );
}
