export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {Icon && <Icon size={56} className="text-gray-300 mb-4" strokeWidth={1.5} />}
      <h3 className="text-elder-lg font-semibold text-gray-500 mb-2">{title}</h3>
      {description && <p className="text-elder-sm text-gray-400 mb-6 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}
