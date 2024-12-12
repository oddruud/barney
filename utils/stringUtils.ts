const formatDistance = (distanceKm: number): string => {
    if (distanceKm === undefined) {
        return "";
    }

    if (distanceKm < 1) {
        return (distanceKm * 1000).toFixed(0) + " m";
    } else {
        return distanceKm.toFixed(1) + " km";
    }
}

const formatTimeSince = (date: Date): string => {
   const now = new Date();
   const diffTime = Math.abs(now.getTime() - date.getTime());
   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
   
   if (diffDays === 0) {
       // Calculate hours difference when less than a day
       const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
       if (diffHours === 0) {
           // Calculate minutes when less than an hour
           const diffMinutes = Math.floor(diffTime / (1000 * 60));
           if (diffMinutes === 0) {
               return "Just now";
           }
           return diffMinutes + (diffMinutes === 1 ? " minute ago" : " minutes ago");
       }
       return diffHours + (diffHours === 1 ? " hour ago" : " hours ago");
   }
   return diffDays + (diffDays === 1 ? " day ago" : " days ago");
}

export { formatDistance, formatTimeSince };