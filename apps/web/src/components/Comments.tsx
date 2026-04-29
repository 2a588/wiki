import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { useToastStore } from "../store/toast";
import { MessageSquare, Send, Trash2, Reply } from "lucide-react";

export function Comments({ pageId }: { pageId: number }) {
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const { addToast } = useToastStore();

  const load = () => api.pages.comments.get(pageId).then(setComments).catch(console.error);
  useEffect(() => { load(); }, [pageId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await api.pages.comments.create(pageId, { content: text, parentId: replyTo });
      setText("");
      setReplyTo(null);
      load();
    } catch (err: any) { addToast("error", err.message); }
  };

  const handleDelete = async (id: number) => {
    try { await api.pages.comments.delete(id); load(); } catch (err: any) { addToast("error", err.message); }
  };

  const topLevel = comments.filter((c) => !c.parent_id);
  const replies = (parentId: number) => comments.filter((c) => c.parent_id === parentId);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <MessageSquare className="w-4 h-4" /> 评论 ({comments.length})
      </h3>

      <form onSubmit={handleSubmit} className="mb-6">
        {replyTo && (
          <div className="text-xs text-gray-400 mb-1">
            回复评论 #{replyTo}
            <button type="button" onClick={() => setReplyTo(null)} className="ml-2 text-blue-500 hover:underline">取消</button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text" className="input text-sm" placeholder="写评论..."
            value={text} onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="btn btn-primary text-sm py-2 px-3">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {topLevel.map((c) => (
          <div key={c.id}>
            <CommentItem comment={c} onReply={setReplyTo} onDelete={handleDelete} />
            {replies(c.id).map((r) => (
              <div key={r.id} className="ml-8 mt-2">
                <CommentItem comment={r} onReply={setReplyTo} onDelete={handleDelete} isReply />
              </div>
            ))}
          </div>
        ))}
        {comments.length === 0 && <p className="text-xs text-gray-400 text-center py-4">暂无评论</p>}
      </div>
    </div>
  );
}

function CommentItem({ comment, onReply, onDelete, isReply }: { comment: any; onReply: (id: number) => void; onDelete: (id: number) => void; isReply?: boolean }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium text-xs text-gray-900 dark:text-gray-100">{comment.display_name}</span>
        <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleString()}</span>
      </div>
      <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
      <div className="flex gap-2 mt-1">
        {!isReply && (
          <button onClick={() => onReply(comment.id)} className="text-xs text-gray-400 hover:text-blue-500 flex items-center gap-1">
            <Reply className="w-3 h-3" /> 回复
          </button>
        )}
        <button onClick={() => onDelete(comment.id)} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1">
          <Trash2 className="w-3 h-3" /> 删除
        </button>
      </div>
    </div>
  );
}
