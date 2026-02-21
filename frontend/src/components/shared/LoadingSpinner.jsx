export default function LoadingSpinner({ text = 'लोड हो रहा है...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4" role="status" aria-live="polite">
      <div className="w-12 h-12 border-4 border-orange-200 border-t-saffron-500 rounded-full animate-spin" />
      <p className="text-elder-base text-gray-500">{text}</p>
    </div>
  );
}
