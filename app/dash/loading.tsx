export default function Loading() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="h-14 glass-card rounded-2xl w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-36 glass-card rounded-2xl" />
        <div className="h-36 glass-card rounded-2xl" />
        <div className="h-36 glass-card rounded-2xl" />
      </div>
      <div className="space-y-3 pt-4">
        <div className="h-16 glass-card rounded-xl w-full" />
        <div className="h-16 glass-card rounded-xl w-full" />
        <div className="h-16 glass-card rounded-xl w-full" />
      </div>
    </div>
  );
}