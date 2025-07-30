import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals((metric) => {
  const description = {
    TTFB: "[Time To First Byte] Sunucunun ilk baytı tarayıcıya ne kadar sürede gönderdiği bilgisi.",
    FCP: "[First Contentful Paint] Kullanıcıya ilk içerik ne zaman gösterildi.",
    FID: "[First Input Delay] Kullanıcının etkileşime geçtiği andan tarayıcının yanıt verdiği ana kadar geçen süre.",
    LCP: "[Largest Contentful Paint] En büyük görsel ya da metnin ekranda görünmesi süresi.",
    CLS: "[Cumulative Layout Shift] Sayfa düzeninin kullanıcıyı rahatsız edecek şekilde kayması.",
  };

  const thresholds = {
    TTFB: 200,      // ms
    FCP: 1800,      // ms
    FID: 100,       // ms
    LCP: 2500,      // ms
    CLS: 0.1,       // ms
  };

  // metrige gore degerler ve durum belirle
  const value = metric.name === 'CLS' ? metric.value.toFixed(3) : Math.round(metric.value);
  const isGood = metric.value < thresholds[metric.name];
  const status = isGood ? '✅ GOOD' : '❌ BAD';

  // console ciktim
  console.log(`📊 Metrik: ${metric.name} - ${description[metric.name]}`);
  console.log(`   Değer: ${value}`);
  console.log(`   Eşik: < ${thresholds[metric.name]}`);
  console.log(`   Durum: ${status}\n`);

});


