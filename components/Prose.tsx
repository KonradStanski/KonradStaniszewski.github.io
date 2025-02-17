export const Prose: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="max-w-none prose prose-headings:underline dark:prose-invert">
      {children}
    </div>
  );
};
