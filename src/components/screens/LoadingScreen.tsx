export function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}
