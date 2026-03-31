import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { api } from "../lib/api";

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const data = await api.auth.login(username, password);
        setAuth(data.user, data.token);
      } else {
        const data = await api.auth.register({ username, email, password, displayName });
        setAuth(data.user, data.token);
      }
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isLogin ? "登录 Wiki" : "注册 Wiki"}
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">用户名</label>
            <input
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">邮箱</label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">显示名称</label>
                <input
                  type="text"
                  className="input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">密码</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? "处理中..." : isLogin ? "登录" : "注册"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {isLogin ? "没有账号？" : "已有账号？"}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="text-blue-600 hover:underline ml-1"
          >
            {isLogin ? "注册" : "登录"}
          </button>
        </p>
      </div>
    </div>
  );
}
