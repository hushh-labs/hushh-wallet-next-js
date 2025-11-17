import './globals.css'

export const metadata = {
  title: 'HUSHH Gold Pass',
  description: 'Exclusive access to premium experiences',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const fontImports = `
    @import url('https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,100..900;1,100..900&family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Saira:ital,wght@0,100..900;1,100..900&family=Stack+Sans+Notch:wght@200..700&family=Tektur:wght@400..900&family=Vend+Sans:ital,wght@0,300..700;1,300..700&display=swap');
  `;

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: fontImports }} />
      </head>
      <body className="vend-sans-elegant bg-deep-lux text-cream">{children}</body>
    </html>
  )
}
