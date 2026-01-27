  const formatTimestamp = (ts?: string) => {
    if (!ts || ts === 'N/A') return 'N/A';
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return ts;
      return d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (err) {
      return ts;
    }
  };

export default formatTimestamp