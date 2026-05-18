import { LoaderCircle } from "lucide-react";

const Loader = ({
  text = "Loading...",
  fullScreen = true,
  size = 40,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${
        fullScreen ? "min-h-screen" : "py-10"
      }`}
    >
      <div className="relative">
        <LoaderCircle
          size={size}
          className="animate-spin text-(--accent)"
        />

        <div className="absolute inset-0 animate-ping rounded-full bg-(--accent)/20" />
      </div>

      <p className="text-sm font-medium tracking-wide text-(--muted)">
        {text}
      </p>
    </div>
  );
};

export default Loader;