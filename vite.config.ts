// Vite配置文件 - 现代前端构建工具配置
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// 根据不同环境(development/production)动态配置
export default defineConfig(({ mode }) => {
  // 加载环境变量 (从.env.* 文件中读取)
  const env = loadEnv(mode, process.cwd());
  
  return {
    // 插件配置
    plugins: [
      react()  // React支持插件，提供JSX转换和热更新
    ],
    
    // 模块解析配置
    resolve: {
      alias: { 
        '@': path.resolve(__dirname, 'src')  // 设置@别名指向src目录，简化导入路径
      },
    },
    
    // 开发服务器配置
    server: {
      port: 3000,  // 开发服务器端口
      proxy: {
        // API代理配置 - 解决开发环境跨域问题
        '/api': {
          target: env.VITE_API_BASE_URL,  // 代理目标地址(从环境变量读取)
          changeOrigin: true,             // 改变请求头中的origin
          rewrite: (p) => p.replace(/^\/api/, ''),  // 重写路径，移除/api前缀
        },
      },
    },
    
    // 构建配置
    build: {
      outDir: 'dist',  // 构建输出目录
      
      // 代码分割优化 - 将第三方库单独打包
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],      // React核心库
            antd: ['antd'],                      // UI组件库
            router: ['react-router-dom'],        // 路由库
            utils: ['axios']                     // 工具库
          }
        }
      },
      
      // 压缩配置 - 使用默认的esbuild压缩
      minify: true,  // 启用压缩（默认使用esbuild，速度更快）
      
      // 静态资源处理
      assetsDir: 'assets',       // 静态资源目录
      chunkSizeWarningLimit: 1000, // chunk大小警告限制(kb)
    },
  };
});