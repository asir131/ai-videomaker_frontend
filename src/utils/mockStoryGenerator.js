/**
 * Generates a mock story when API quota is exceeded
 * Creates an engaging 150-word story based on the title
 */
export function generateMockStory(title, wordCount = 150) {
  // Extract key words from title for story generation
  const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const mainTheme = titleWords[0] || 'mystery';
  
  // Story templates that can be adapted
  const storyTemplates = [
    `In the heart of ${title.toLowerCase()}, something extraordinary was about to unfold. The air crackled with anticipation as shadows danced across ancient walls. Suddenly, a discovery that would change everything emerged from the darkness. Secrets long buried began to surface, revealing truths that no one expected. The journey ahead promised danger, mystery, and revelations that would shake the very foundations of what was known.`,
    
    `The story of ${title.toLowerCase()} began on a night like no other. Whispers echoed through empty corridors, carrying tales of forgotten legends. As the moon cast its silver glow, ancient forces stirred. What seemed impossible became reality, and the boundaries between worlds blurred. The truth, hidden for centuries, finally demanded to be heard.`,
    
    `Deep within the realm of ${title.toLowerCase()}, a legend was born. Every step forward revealed new mysteries, each more intriguing than the last. The past and present collided in ways that defied explanation. Heroes emerged from unexpected places, ready to face whatever challenges lay ahead. The adventure had only just begun.`
  ];
  
  // Select template based on title hash for variety
  const templateIndex = title.length % storyTemplates.length;
  let story = storyTemplates[templateIndex];
  
  // Customize based on title words
  if (titleWords.length > 1) {
    const secondWord = titleWords[1];
    story = story.replace(/the realm of/g, `the ${secondWord}`);
    story = story.replace(/something extraordinary/g, `a ${secondWord}`);
  }
  
  // Ensure story is approximately the requested word count
  const words = story.split(/\s+/);
  if (words.length < wordCount) {
    // Expand the story to reach target word count
    const expansion = `The mystery deepened with each passing moment. Clues appeared like breadcrumbs leading to an unknown destination. Time seemed to stand still as the pieces of the puzzle slowly came together. Nothing would ever be the same after this revelation. The journey continued, filled with unexpected twists and turns that kept everyone on the edge of their seats.`;
    story = story + ' ' + expansion;
  }
  
  // Trim to exact word count
  const finalWords = story.split(/\s+/);
  if (finalWords.length > wordCount) {
    story = finalWords.slice(0, wordCount).join(' ');
  }
  
  // Ensure proper ending
  if (!story.endsWith('.') && !story.endsWith('!') && !story.endsWith('?')) {
    story += '.';
  }
  
  return story;
}

