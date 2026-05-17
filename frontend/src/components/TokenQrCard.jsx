import QRCode from "react-qr-code";

const TokenQrCard = ({
    title,
    token,
    description,
    emptyMessage = "Token not available yet.",
}) => {
    return (
        <div className="rounded-3xl border border-white/80 bg-white/85 p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-(--ink)">{title}</p>
                    {description ? (
                        <p className="mt-1 text-xs leading-5 text-(--muted)">{description}</p>
                    ) : null}
                </div>
                <span className="rounded-full bg-(--accent-2)/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-2)]">
                    QR
                </span>
            </div>
            {token ? (
                <div className="mt-4 space-y-4">
                    <div className="grid place-items-center rounded-3xl bg-white p-4 shadow-sm">
                        <QRCode value={token} size={160} />
                    </div>
                    <p className="break-all rounded-2xl bg-(--bg) px-4 py-3 text-xs text-(--muted)">
                        {token}
                    </p>
                </div>
            ) : (
                <p className="mt-4 rounded-2xl bg-(--bg) px-4 py-3 text-sm text-(--muted)">
                    {emptyMessage}
                </p>
            )}
        </div>
    );
};

export default TokenQrCard;
