
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Critical: Root element not found!");
} else {
  try {
    // پاکسازی متن لودینگ اولیه قبل از تزریق React
    if (rootElement.innerHTML.includes('در حال بیدار کردن')) {
      rootElement.innerHTML = '';
    }
    
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
  } catch (error: any) {
    console.error("Render Error:", error);
    rootElement.innerHTML = `
      <div style="background: #020617; color: #ef4444; padding: 40px; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; font-family: 'Vazirmatn', sans-serif;">
        <h1 style="font-size: 24px; margin-bottom: 20px;">خطا در اجرای روبوکا</h1>
        <p style="color: #94a3b8; max-width: 500px; font-size: 14px;">${error.message}</p>
        <button onclick="location.reload()" style="margin-top: 30px; background: #6366f1; color: white; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: bold;">تلاش مجدد</button>
      </div>
    `;
  }
}
