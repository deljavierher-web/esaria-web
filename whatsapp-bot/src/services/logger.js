function format(level, message, meta) {
  const entry = {
    level,
    message,
    time: new Date().toISOString()
  };

  if (meta) {
    entry.meta = meta instanceof Error ? { message: meta.message, stack: meta.stack } : meta;
  }

  return JSON.stringify(entry);
}

module.exports = {
  info(message, meta) {
    console.log(format("info", message, meta));
  },
  warn(message, meta) {
    console.warn(format("warn", message, meta));
  },
  error(message, meta) {
    console.error(format("error", message, meta));
  }
};
