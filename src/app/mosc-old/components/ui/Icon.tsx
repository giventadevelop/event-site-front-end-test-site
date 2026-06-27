import React from 'react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

const Icon: React.FC<IconProps> = ({ name, size = 16, className = '', color }) => {
  // Sacred icon mapping with emoji representations
  const iconMap: Record<string, string> = {
    // Religious symbols
    'cross': '✟',
    'cross-alt': '✚',
    'star': '⭐',
    'heart': '❤️',
    'dove': '🕊️',
    'angel': '👼',
    'crown': '👑',
    'book': '📖',
    'bible': '📖',
    'prayer': '🙏',

    // Church elements
    'church': '⛪',
    'bell': '🔔',
    'candle': '🕯️',
    'flame': '🔥',
    'light': '💡',
    'altar': '⛩️',

    // People and community
    'people': '👥',
    'person': '👤',
    'family': '👨‍👩‍👧‍👦',
    'child': '👶',
    'elder': '👴',
    'priest': '👨‍💼',

    // Communication
    'phone': '📞',
    'email': '📧',
    'message': '💬',
    'notification': '🔔',
    'announcement': '📢',

    // Navigation
    'arrow-right': '→',
    'arrow-left': '←',
    'arrow-up': '↑',
    'arrow-down': '↓',
    'chevron-right': '>',
    'chevron-left': '<',
    'chevron-up': '^',
    'chevron-down': 'v',

    // Actions
    'plus': '+',
    'minus': '-',
    'check': '✓',
    'close': '✕',
    'edit': '✏️',
    'delete': '🗑️',
    'save': '💾',
    'download': '⬇️',
    'upload': '⬆️',
    'search': '🔍',
    'filter': '🔍',
    'menu': '☰',
    'settings': '⚙️',

    // Time and calendar
    'calendar': '📅',
    'clock': '🕐',
    'time': '⏰',
    'schedule': '📋',
    'event': '🎉',

    // Media
    'image': '🖼️',
    'video': '🎥',
    'audio': '🎵',
    'gallery': '🖼️',
    'play': '▶️',
    'pause': '⏸️',
    'stop': '⏹️',

    // Documents
    'document': '📄',
    'file': '📁',
    'folder': '📂',
    'pdf': '📄',
    'download-file': '📥',

    // Location
    'map': '📍',
    'location': '📍',
    'pin': '📍',
    'marker': '📍',

    // Weather and nature
    'sun': '☀️',
    'moon': '🌙',
    'cloud': '☁️',
    'rain': '🌧️',
    'flower': '🌸',
    'tree': '🌳',

    // Default fallback
    'default': '●',
  };

  const icon = iconMap[name.toLowerCase()] || iconMap['default'];

  const style: React.CSSProperties = {
    fontSize: size,
    lineHeight: 1,
    color: color || 'inherit',
    display: 'inline-block',
    verticalAlign: 'middle',
  };

  return (
    <span
      className={className}
      style={style}
      role="img"
      aria-label={name}
    >
      {icon}
    </span>
  );
};

export default Icon;














