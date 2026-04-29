"use client";

import * as React from "react";
import { Input } from "./input";
import { PenLine } from "lucide-react";

type Props = {
  value: string;
  onChange: (name: string) => void;
  placeholder?: string;
  hint?: string;
  readOnly?: boolean;
};

/**
 * Digital signature rendered as the signer's printed name.
 * Matches Indonesian government "tanda tangan elektronik" practice: nama terang
 * sebagai tanda persetujuan.
 */
export function SignatureNameField({
  value,
  onChange,
  placeholder = "Nama lengkap",
  hint,
  readOnly = false,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-dashed border-brand-300 bg-brand-50/60 p-4 sm:p-5">
        <div className="flex items-center gap-2 text-xs text-brand-700 font-medium">
          <PenLine className="h-3.5 w-3.5" />
          Tanda tangan elektronik
        </div>
        <p
          className={`mt-3 text-2xl sm:text-3xl font-signature italic text-brand-900 break-words min-h-[2.5rem]`}
          style={{ fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive" }}
        >
          {value || <span className="opacity-30">Nama akan tampil di sini</span>}
        </p>
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={readOnly ? "bg-zinc-50 cursor-not-allowed" : ""}
      />
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}
