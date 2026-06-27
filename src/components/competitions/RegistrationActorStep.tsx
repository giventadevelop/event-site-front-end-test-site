'use client';

import type { RegistrationActorMode } from '@/types';

interface Props {
  registrationMode: string;
  audienceMode: string;
  value: RegistrationActorMode;
  onChange: (mode: RegistrationActorMode) => void;
}

export default function RegistrationActorStep({ registrationMode, audienceMode, value, onChange }: Props) {
  const showMixed = registrationMode === 'MIXED' || audienceMode === 'MIXED';

  if (!showMixed) return null;

  const options: { mode: RegistrationActorMode; label: string; description: string }[] = [
    {
      mode: 'PARENT',
      label: 'Register a child',
      description: 'Parent or guardian registering one or more youth participants',
    },
    {
      mode: 'SELF',
      label: 'Register myself',
      description: 'Adult participant registering for yourself',
    },
    {
      mode: 'TEAM_CAPTAIN',
      label: 'Register a team',
      description: 'Team captain registering a group for team competitions',
    },
  ];

  return (
    <div className="bg-card rounded-lg sacred-shadow p-6 space-y-4">
      <h2 className="font-heading font-semibold text-xl">Who are you registering?</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {options.map((opt) => (
          <button
            key={opt.mode}
            type="button"
            onClick={() => onChange(opt.mode)}
            className={`text-left p-4 rounded-xl border-2 transition-all ${
              value === opt.mode
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <p className="font-semibold">{opt.label}</p>
            <p className="text-sm text-muted-foreground mt-1">{opt.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
