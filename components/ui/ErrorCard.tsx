type ErrorCardProps = {
  message: string;
};

export function ErrorCard({ message }: ErrorCardProps) {
  return (
    <div className="rounded border border-dash-danger bg-dash-card p-4 text-sm text-dash-danger">
      {message}
    </div>
  );
}
