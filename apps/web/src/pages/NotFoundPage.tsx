import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">页面未找到</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">你访问的页面不存在或已被删除</p>
        <Link to="/" className="btn btn-primary">返回首页</Link>
      </div>
    </div>
  );
}
