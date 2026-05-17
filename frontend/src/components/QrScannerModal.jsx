import { useEffect, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Camera, X } from "lucide-react";

const QrScannerModal = ({
    open,
    title = "Scan QR code",
    description,
    onClose,
    onScan,
}) => {
    const [error, setError] = useState("");

    useEffect(() => {
        if (open) {
            setError("");
        }
    }, [open]);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-90 grid place-items-center bg-black/50 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl border border-white/80 bg-white p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="inline-flex items-center gap-2 rounded-full bg-(--accent-2)/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-(--accent-2)">
                            <Camera className="h-4 w-4" />
                            Scanner
                        </p>
                        <h3 className="mt-3 font-display text-2xl">{title}</h3>
                        {description ? (
                            <p className="mt-2 text-sm text-(--muted)">{description}</p>
                        ) : null}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-(--accent-2) p-2 text-(--accent-2)"
                        aria-label="Close scanner"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="mt-5 overflow-hidden rounded-3xl border border-white/80 bg-(--bg)">
                    {error ? (
                        <div className="grid min-h-72 place-items-center px-6 py-10 text-center text-sm text-(--muted)">
                            {error}
                        </div>
                    ) : (
                        <Scanner
                            onScan={(detectedCodes) => {
                                const token = detectedCodes.find((item) => item.rawValue?.trim())?.rawValue?.trim();

                                if (!token) {
                                    return;
                                }

                                onScan(token);
                                onClose();
                            }}
                            onError={(scannerError) => {
                                setError(
                                    scannerError?.message ||
                                        "Camera access is blocked. Allow camera permission to scan the QR code."
                                );
                            }}
                            constraints={{
                                facingMode: "environment",
                            }}
                            formats={["qr_code"]}
                            allowMultiple
                            scanDelay={800}
                            components={{
                                finder: true,
                                onOff: false,
                                torch: true,
                                zoom: false,
                            }}
                            classNames={{
                                container: "min-h-72 bg-black",
                                video: "min-h-72 w-full object-cover",
                            }}
                        />
                    )}
                </div>

                <p className="mt-4 text-xs text-(--muted)">
                    Point the camera at the QR code. The token will fill in automatically once detected.
                </p>
            </div>
        </div>
    );
};

export default QrScannerModal;
