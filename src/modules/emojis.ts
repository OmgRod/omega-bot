const emojiDictionary: Record<string, string> = {
    check: '1338909544268693544',
    cross: '1338911319876833361',
    hourglass: '1338963250380935309',
    ban: '1340036515098660996',
    hammer: '1340036532458885311',
    info: '1340038461411037355',
    warning: '1340039071627477095',
  };
  
  function getEmojiString(name: string): string {
    const emojiId = emojiDictionary[name];
    if (!emojiId) {
      return `Emoji not found: ${name}`;
    }
    return `<:${name}:${emojiId}>`;
  }
  
  export { getEmojiString };
  