// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { ConfigProvider } from 'antd';
import RouterConfig from '@/route/router';
import zhCN from 'antd/locale/zh_CN';
import './App.css'
const App: React.FC = () => {
  return<ConfigProvider locale={zhCN}>
    <RouterConfig />
  </ConfigProvider>;
};

export default App
