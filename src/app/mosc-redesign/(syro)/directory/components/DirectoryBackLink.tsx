import Link from 'next/link';

type DirectoryBackLinkProps = {
  href: string;
  /** Visible label, e.g. "Back to Directory" or "Back to Bishops" */
  label: string;
  /** Extra classes for spacing (e.g. mb-4, mt-4, mb-6) */
  className?: string;
};

/**
 * Directory back navigation — matches institutions-cms / syro-primary-button card CTA style.
 */
export default function DirectoryBackLink({
  href,
  label,
  className = 'mb-4',
}: DirectoryBackLinkProps) {
  return (
    <Link
      href={href}
      className={`syro-primary-button inline-flex items-center gap-2 w-fit ${className}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16l-4-4m0 0l4-4m-4 4h18"
        />
      </svg>
      <span>{label}</span>
    </Link>
  );
}
