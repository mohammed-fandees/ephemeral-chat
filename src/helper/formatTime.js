const formatTime = (ISOString) => {
  return new Date(ISOString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default formatTime;