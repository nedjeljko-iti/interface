export const metadata = {
  title: 'Import temeljnica',
};

export default function RootLayout({ children }) {
  return (
    <html lang="hr">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
