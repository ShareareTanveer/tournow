'use client'

import {
  FiBarChart2,
  FiBookOpen,
  FiCode,
  FiFileText,
  FiHelpCircle,
  FiHome,
  FiImage,
  FiInfo,
  FiLayout,
  FiMap,
  FiMessageCircle,
  FiPackage,
  FiSend,
  FiStar,
} from 'react-icons/fi'
import type { IconType } from 'react-icons'

const ICONS: Record<string, IconType> = {
  home: FiHome,
  info: FiInfo,
  book: FiBookOpen,
  star: FiStar,
  image: FiImage,
  'bar-chart': FiBarChart2,
  package: FiPackage,
  map: FiMap,
  'help-circle': FiHelpCircle,
  'message-circle': FiMessageCircle,
  send: FiSend,
  code: FiCode,
  layout: FiLayout,
  'file-text': FiFileText,
}

export default function DestinationBuilderSectionIcon({
  iconName,
  className = 'h-4 w-4',
}: {
  iconName?: string
  className?: string
}) {
  const Icon = iconName ? ICONS[iconName] ?? FiFileText : FiFileText
  return <Icon className={className} />
}
