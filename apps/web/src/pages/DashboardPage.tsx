import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { PageSkeleton } from "../components/Skeleton";
import { Clock, Star, Grid3X3, Activity, ChevronRight } from "lucide-react";

export function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard.get().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSkeleton />;

  return (
    <div className="flex-1 p-6 sm:p-8 overflow-auto">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">首页</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Section icon={Clock} title="最近编辑" href="/">
            {data?.recentPages?.length === 0 ? (
              <Empty text="还没有编辑过页面" />
            ) : (
              data?.recentPages?.map((p: any) => (
                <PageRow key={p.id} page={p} />
              ))
            )}
          </Section>

          <Section icon={Star} title="收藏页面" href="/">
            {data?.favorites?.length === 0 ? (
              <Empty text="还没有收藏任何页面" />
            ) : (
              data?.favorites?.map((p: any) => (
                <PageRow key={p.id} page={p} />
              ))
            )}
          </Section>

          <Section icon={Grid3X3} title="空间概览" href="/spaces">
            <div className="grid grid-cols-2 gap-2">
              {data?.spaces?.map((s: any) => (
                <Link key={s.id} to={`/space/${s.id}`}
                  className="card p-3 hover:shadow-md transition-shadow text-sm group"
                >
                  <div className="font-medium group-hover:text-blue-600 truncate">{s.icon} {s.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{s.page_count} 个页面</div>
                </Link>
              ))}
            </div>
          </Section>

          <Section icon={Activity} title="我的动态" href="/">
            {data?.recentActivity?.length === 0 ? (
              <Empty text="还没有活动记录" />
            ) : (
              data?.recentActivity?.slice(0, 8).map((a: any, i: number) => (
                <Link key={i} to={`/page/${a.page_id}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 text-sm group"
                >
                  <span>{a.icon || "📄"}</span>
                  <span className="flex-1 truncate">{a.title}</span>
                  <span className="text-xs text-gray-400">
                    v{a.version} · {timeAgo(a.created_at)}
                  </span>
                </Link>
              ))
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children, href }: { icon: any; title: string; children: React.ReactNode; href: string }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <Icon className="w-4 h-4" />
          {title}
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300" />
      </div>
      <div className="p-2 space-y-0.5">{children}</div>
    </div>
  );
}

function PageRow({ page }: { page: any }) {
  return (
    <Link to={`/page/${page.id}`}
      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 text-sm group"
    >
      <span>{page.icon || "📄"}</span>
      <span className="flex-1 truncate">{page.title}</span>
      <span className="text-xs text-gray-400 hidden sm:inline">{page.space_name}</span>
    </Link>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-xs text-gray-400 text-center py-6">{text}</p>;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins} 分钟前`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} 小时前`;
  const days = Math.floor(hrs / 24);
  return `${days} 天前`;
}
