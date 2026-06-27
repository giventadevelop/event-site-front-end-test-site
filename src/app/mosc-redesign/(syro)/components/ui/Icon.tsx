import React from 'react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

const Icon: React.FC<IconProps> = ({ name, size = 16, className = '', color }) => {
  const iconMap: Record<string, string> = {
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
    'church': '⛪',
    'bell': '🔔',
    'candle': '🕯️',
    'flame': '🔥',
    'light': '💡',
    'altar': '⛩️',
    'people': '👥',
    'person': '👤',
    'family': '👨‍👩‍👧‍👦',
    'child': '👶',
    'elder': '👴',
    'priest': '👨‍💼',
    'phone': '📞',
    'email': '📧',
    'message': '💬',
    'notification': '🔔',
    'announcement': '📢',
    'arrow-right': '→',
    'arrow-left': '←',
    'arrow-up': '↑',
    'arrow-down': '↓',
    'chevron-right': '>',
    'chevron-left': '<',
    'chevron-up': '^',
    'chevron-down': 'v',
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
    'calendar': '📅',
    'clock': '🕐',
    'time': '⏰',
    'schedule': '📋',
    'event': '🎉',
    'image': '🖼️',
    'video': '🎥',
    'audio': '🎵',
    'gallery': '🖼️',
    'play': '▶️',
    'pause': '⏸️',
    'stop': '⏹️',
    'document': '📄',
    'file': '📁',
    'folder': '📂',
    'pdf': '📄',
    'download-file': '📥',
    'map': '📍',
    'location': '📍',
    'pin': '📍',
    'marker': '📍',
    'sun': '☀️',
    'moon': '🌙',
    'cloud': '☁️',
    'rain': '🌧️',
    'flower': '🌸',
    'tree': '🌳',
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
    <span className={className} style={style} role="img" aria-label={name}>
      {icon}
    </span>
  );
};

export default Icon;
