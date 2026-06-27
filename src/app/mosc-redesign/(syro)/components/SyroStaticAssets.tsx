import Script from 'next/script';

/**
 * Renders static Syro CSS and font links in the initial HTML so styles are available
 * from first paint, preventing menu bar flickering. Server Component - no client-side injection.
 */
export default function SyroStaticAssets() {
  const base = '/mosc/assets';
  return (
    <>
      {/* Preconnect for Google Fonts - in head via Next.js convention we render early in body */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {/* Syro styles - available from first paint, eliminates flicker */}
      <link rel="stylesheet" href={`${base}/css/bootstrap.min.css`} data-syro-static="true" />
      {/* Bootstrap JS for tooltips (e.g. location pins on map) */}
      <Script src={`${base}/js/bootstrap.bundle.min.js`} strategy="afterInteractive" />
      <link rel="stylesheet" href={`${base}/css/swiper-bundle.min.css`} data-syro-static="true" />
      <link rel="stylesheet" href={`${base}/css/tiny-slider.css`} data-syro-static="true" />
      <link rel="stylesheet" href={`${base}/fonts/fontawesome/css/all.min.css`} data-syro-static="true" />
      <link rel="stylesheet" href={`${base}/css/style.css`} data-syro-static="true" />
      <link rel="stylesheet" href={`${base}/css/style-inner.css`} data-syro-static="true" />
      <link rel="stylesheet" href={`${base}/css/design-system-override.css`} data-syro-static="true" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400&family=Playfair+Display:wght@400;600;700;800&family=Anek+Malayalam:wght@100;200;300;400;500;600;700;800&display=swap"
        data-syro-static="true"
      />
    </>
  );
}
