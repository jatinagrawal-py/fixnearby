// frontend/src/utils/lucideIconMap.js
import {
  Wrench,
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Shield,
  Star,
  CheckCircle,
  MessageCircle,
  Navigation,
  Filter,
  Search,
  MoreVertical,
  AlertCircle,
  TrendingUp,
  Award,
  Target,
  User,
  Phone,
  Mail,
  Clock,
  DollarSign,
  LogOut,
  Settings,
  ArrowRight,
  Users,
  X,
  Bell,
  MapPin, // Added MapPin as it's used in job cards
  Info, // For notifications
  XCircle // For notifications
} from 'lucide-react';

// This object maps string names (from backend or internal logic) to Lucide React components
export const lucideIconMap = {
  Wrench: Wrench,
  Zap: Zap,
  Droplets: Droplets,
  Hammer: Hammer,
  Paintbrush: Paintbrush,
  Shield: Shield,
  Star: Star,
  CheckCircle: CheckCircle,
  MessageCircle: MessageCircle,
  Navigation: Navigation,
  Filter: Filter,
  Search: Search,
  MoreVertical: MoreVertical,
  AlertCircle: AlertCircle,
  TrendingUp: TrendingUp,
  Award: Award,
  Target: Target,
  User: User,
  Phone: Phone,
  Mail: Mail,
  Clock: Clock,
  DollarSign: DollarSign,
  LogOut: LogOut,
  Settings: Settings,
  ArrowRight: ArrowRight,
  Users: Users,
  X: X,
  Bell: Bell,
  MapPin: MapPin,
  Info: Info,
  XCircle: XCircle,
  // Add more mappings as needed based on service types or other dynamic icon needs
  plumbing: Droplets, // For consistent category mapping in job cards
  electrical: Zap,
  carpentry: Hammer,
  painting: Paintbrush,
  hvac: Wrench, // Assuming HVAC uses a wrench icon
  security: Shield, // Assuming Home Security uses a shield icon
  electronics: Zap, // Reusing Zap for electronics
  appliances: Wrench, // Reusing Wrench for appliances
  automotive: Shield, // Reusing Shield for automotive
  other: Wrench, // Default icon
};

// Optional: A helper function to get an icon component by name
export const getLucideIcon = (iconName, fallbackIcon = Wrench) => {
  return lucideIconMap[iconName] || fallbackIcon;
};