const emojiDictionary: Record<string, string> = {
    check: '1338909544268693544',
    cross: '1338911319876833361',
    hourglass: '1338963250380935309',
    ban: '1340401856333217812',
    hammer: '1340394089300099235',
    info: '1340394057557610506',
    warning: '1340394129380741200',
    calendar: '1340400889550209096',
  };
  
  function getEmojiString(name: string): string {
    const emojiId = emojiDictionary[name];
    if (!emojiId) {
      return `Emoji not found: ${name}`;
    }
    return `<:${name}:${emojiId}>`;
  }
  
  export { getEmojiString };
  