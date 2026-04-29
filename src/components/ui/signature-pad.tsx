"use client";

import * as React from "react";
import SignaturePad from "signature_pad";
import { Button } from "./button";
import { Eraser } from "lucide-react";

type Props = {
  onChange: (dataUrl: string | null) => void;
  initialValue?: string | null;
  className?: string;
  height?: number;
};

export function SignaturePadField({ onChange, initialValue, height = 180 }: Props) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const padRef = React.useRef<SignaturePad | null>(null);
  const [isEmpty, setIsEmpty] = React.useState(!initialValue);

  const resizeCanvas = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    ctx?.scale(ratio, ratio);
    padRef.current?.clear();
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pad = new SignaturePad(canvas, {
      penColor: "#111827",
      backgroundColor: "rgba(255,255,255,0)",
      minWidth: 1,
      maxWidth: 2.5,
    });
    padRef.current = pad;
    resizeCanvas();

    const update = () => {
      if (pad.isEmpty()) {
        setIsEmpty(true);
        onChange(null);
      } else {
        setIsEmpty(false);
        onChange(pad.toDataURL("image/png"));
      }
    };
    pad.addEventListener("endStroke", update);

    if (initialValue) {
      pad.fromDataURL(initialValue);
    }

    const handleResize = () => resizeCanvas();
    window.addEventListener("resize", handleResize);
    return () => {
      pad.removeEventListener("endStroke", update);
      window.removeEventListener("resize", handleResize);
      pad.off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClear = () => {
    padRef.current?.clear();
    setIsEmpty(true);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <div
        className="signature-wrapper"
        style={{ height }}
        aria-label="Area tanda tangan"
      >
        <canvas
          ref={canvasRef}
          className="h-full w-full touch-none"
          style={{ width: "100%", height: "100%" }}
        />
        {isEmpty && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-zinc-400">
            Gambar tanda tangan di sini
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>Gunakan mouse / stylus / jari (mobile)</span>
        <Button type="button" variant="ghost" size="sm" onClick={handleClear} disabled={isEmpty}>
          <Eraser className="h-3.5 w-3.5" /> Hapus
        </Button>
      </div>
    </div>
  );
}
