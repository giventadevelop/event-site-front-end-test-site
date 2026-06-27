import Script from 'next/script';

/** Giventa Inc. SalesIQ embed (MOSC redesign). Override via NEXT_PUBLIC_ZOHO_SALESIQ_WIDGET_URL. */
const DEFAULT_WIDGET_SRC =
  'https://salesiq.zohopublic.com/widget?wc=siqbe8568b33d4324158e8ce69784c5036bbf71674335df3b9d0651c884762072d0';

/** Keep chat minimized on narrow viewports so it does not cover the page (incl. devtools mobile). */
const SALESIQ_INIT_SCRIPT = `
window.$zoho=window.$zoho||{};$zoho.salesiq=$zoho.salesiq||{ready:function(){}};
(function(){
  var MOBILE_MQ=window.matchMedia('(max-width: 767px)');
  function isMobile(){return MOBILE_MQ.matches;}
  function minimizeSalesIq(){
    try{
      var siq=window.$zoho&&window.$zoho.salesiq;
      if(!siq)return;
      if(typeof siq.floatwindow!=='undefined'&&siq.floatwindow.minimize){
        siq.floatwindow.minimize();
      }
      if(isMobile()&&typeof siq.chatwindow!=='undefined'&&siq.chatwindow.visible){
        siq.chatwindow.visible('hide');
      }
    }catch(e){}
  }
  var prevReady=$zoho.salesiq.ready;
  $zoho.salesiq.ready=function(){
    if(typeof prevReady==='function'){try{prevReady();}catch(e){}}
    minimizeSalesIq();
    if(!window.__moscSalesIqResizeBound){
      window.__moscSalesIqResizeBound=true;
      window.addEventListener('resize',function(){
        if(isMobile()){minimizeSalesIq();}
      });
      if(MOBILE_MQ.addEventListener){
        MOBILE_MQ.addEventListener('change',function(){
          if(MOBILE_MQ.matches){minimizeSalesIq();}
        });
      }
    }
  };
})();
`;

export default function ZohoSalesIqWidget() {
  const widgetSrc =
    process.env.NEXT_PUBLIC_ZOHO_SALESIQ_WIDGET_URL ?? DEFAULT_WIDGET_SRC;

  return (
    <>
      <Script
        id="zoho-salesiq-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: SALESIQ_INIT_SCRIPT,
        }}
      />
      <Script id="zsiqscript" src={widgetSrc} strategy="lazyOnload" />
    </>
  );
}
