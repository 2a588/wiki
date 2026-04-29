import { Link } from "react-router-dom";

type SpaceCardProps = {
  space: any;
  onDelete?: (id: number) => void;
};

export default function SpaceCard({ space, onDelete }: SpaceCardProps) {
  return (
    <Link to={`/space/${space.id}`} className="card p-4 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xl select-none">
            <span aria-label="space-icon">{space.icon || "📁"}</span>
          </div>
          <div>
            <h3 className="font-semibold group-hover:text-blue-600">{space.name}</h3>
            <span className="text-xs text-gray-400">{space.key}</span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            if (onDelete) onDelete(space.id);
          }}
          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="删除空间"
          title="删除空间"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5h6v2m-3 0v12m-6-12v12m6 0h-6" />
          </svg>
        </button>
      </div>
      {space.description && (
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{space.description}</p>
      )}
    </Link>
  );
}
