
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
};

// Helper function to map roles to subscription types
export const getRoleSubscriptionType = (role: string): string => {
  switch (role) {
    case 'creator':
      return 'creator';
    case 'admin':
      return 'admin';
    case 'moderator':
      return 'moderator';
    default:
      return 'free';
  }
};

// Helper function to get badge styling based on subscription type
export const getSubscriptionBadgeStyles = (subscriptionType: string | null): string => {
  switch (subscriptionType) {
    case 'creator':
      return "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800";
    case 'admin':
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
    case 'moderator':
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
    case 'premium':
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
    case 'business':
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
    case 'sponsor':
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800";
    default:
      return "";
  }
};

// Improved helper to get access level with correct hierarchy
export const getAccessLevel = (role: string | null, subscriptionType: string | null): number => {
  const ACCESS_LEVELS = {
    'free': 0,
    'premium': 1,
    'business': 2,
    'sponsor': 3,
    'moderator': 4,
    'admin': 5,
    'creator': 6
  };

  const roleLevel = role ? ACCESS_LEVELS[role as keyof typeof ACCESS_LEVELS] || 0 : 0;
  const subscriptionLevel = subscriptionType ? ACCESS_LEVELS[subscriptionType as keyof typeof ACCESS_LEVELS] || 0 : 0;

  return Math.max(roleLevel, subscriptionLevel);
};
