"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Result = {
  success: boolean;
  error?: { message: string; fieldErrors?: Record<string, string[]> };
};
export function AdminForm({
  action,
  children,
  submitLabel = "Save changes",
  className = "admin-form",
  onSuccess,
  confirmMessage,
  submitClassName = "button",
}: {
  action: (formData: FormData) => Promise<Result | void>;
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
  /** Runs after a successful save — e.g. to close a modal. */
  onSuccess?: () => void;
  /** When set, ask for confirmation before submitting (e.g. destructive ops). */
  confirmMessage?: string;
  /** Overrides the submit button class, e.g. for a danger action. */
  submitClassName?: string;
}) {
  const [pending, setPending] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [result, setResult] = useState<Result>();
  const router = useRouter();
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  return (
    <form
      className={className}
      onChange={() => setDirty(true)}
      action={async (formData) => {
        if (confirmMessage && !window.confirm(confirmMessage)) return;
        setPending(true);
        setResult(undefined);
        const response = await action(formData);
        setResult(response || undefined);
        setPending(false);
        if (response?.success) {
          setDirty(false);
          router.refresh();
          onSuccess?.();
        }
      }}
    >
      {children}
      {result && !result.success && (
        <div className="admin-form-error" role="alert">
          <strong>Could not save</strong>
          <span>{result.error?.message}</span>
          {result.error?.fieldErrors && (
            <ul>
              {Object.entries(result.error.fieldErrors).flatMap(
                ([field, errors]) =>
                  errors.map((error) => (
                    <li key={`${field}-${error}`}>
                      {field}: {error}
                    </li>
                  )),
              )}
            </ul>
          )}
        </div>
      )}
      {result?.success && (
        <div className="admin-form-success" role="status">
          Changes saved successfully.
        </div>
      )}
      <button className={submitClassName} type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

export function ConfirmForm({
  action,
  children,
  confirmMessage,
  className,
}: {
  action: (formData: FormData) => Promise<Result | void>;
  children: React.ReactNode;
  confirmMessage: string;
  className?: string;
}) {
  return (
    <form
      className={className}
      action={async (formData) => {
        await action(formData);
      }}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
    >
      {children}
    </form>
  );
}
