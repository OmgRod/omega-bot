const emojiDictionary: Record<string, string> = {
    checksolid: '1338909544268693544',
    xmarksolid: '1338911319876833361',
    hourglass: '1338963250380935309'
  };
  
  function getEmojiString(name: string): string {
    const emojiId = emojiDictionary[name];
    if (!emojiId) {
      return `Emoji not found: ${name}`;
    }
    return `<:${name}:${emojiId}>`;
  }
  
  export { getEmojiString };
  