// components/ui/IconSymbol.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

type IconSymbolProps = {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  size?: number;
};

export function IconSymbol({ name, color, size = 24 }: IconSymbolProps) {
  return <Ionicons name={name} color={color} size={size} />;
}
