import { generateImagePrompt as generateImagePromptAPI } from './scriptService.js';
import { generateImage } from './imageService.js';

/**
 * Map style names to Ideogram style types
 */
export function getIdeogramStyleType(styleName) {
    const styleMap = {
        'realistic': 'REALISTIC',
        'cinematic': 'REALISTIC',
        'black & white': 'REALISTIC',
        'oil painting': 'GENERAL',
        '3d model': 'RENDER_3D',
        'drawing': 'GENERAL',
        'comic book': 'GENERAL',
        'anime': 'ANIME',
        'pixel art': 'GENERAL',
        'pop art': 'GENERAL',
        'watercolor': 'GENERAL',
        'stick-style': 'DESIGN',
        'stick style': 'DESIGN',
        'naruto anime': 'ANIME',
        'naruto-anime': 'ANIME',
        'game of thrones': 'REALISTIC',
        'game-of-thrones': 'REALISTIC'
    };

    const lowerStyle = styleName.toLowerCase();
    return styleMap[lowerStyle] || 'GENERAL';
}

/**
 * Extract and save character descriptions from scene text and generated prompt
 */
export function extractAndSaveCharacters(sceneText, generatedPrompt, characterMemory, sceneIndex) {
    const newMemory = { ...characterMemory };

    // SPECIES DETECTION AND LOCKING (Scene 1 only)
    if (sceneIndex === 0) {
        const promptLower = generatedPrompt.toLowerCase();

        const animalSpecies = [
            'lion', 'lioness', 'elephant', 'tiger', 'leopard', 'cheetah',
            'wolf', 'bear', 'fox', 'deer', 'giraffe', 'zebra', 'monkey',
            'dog', 'cat', 'bird', 'eagle', 'hawk', 'owl', 'horse', 'rabbit'
        ];

        let detectedSpecies = null;
        for (const animal of animalSpecies) {
            if (promptLower.includes(animal)) {
                detectedSpecies = animal;
                break;
            }
        }

        if (detectedSpecies) {
            newMemory['MAIN_SPECIES'] = detectedSpecies;
            newMemory['SPECIES_LOCK'] = 'ANIMAL';

            const animalDescPattern = new RegExp(`(a[^,\\.]*${detectedSpecies}[^,\\.]{0,100})`, 'i');
            const animalMatch = generatedPrompt.match(animalDescPattern);
            if (animalMatch) {
                newMemory['MainCharacter'] = animalMatch[1].trim();
            }
        } else if (promptLower.includes('person') || promptLower.includes('man') ||
            promptLower.includes('woman') || promptLower.includes('child') ||
            promptLower.match(/\d+[-\s]year[-\s]old/)) {
            newMemory['SPECIES_LOCK'] = 'HUMAN';
        }
    }

    // Extract names
    const namePattern = /\b([A-Z][a-z]+)\b/g;
    const names = {};
    let match;

    while ((match = namePattern.exec(sceneText)) !== null) {
        const name = match[1];
        if (['The', 'This', 'That', 'She', 'He', 'They', 'I', 'It', 'We', 'You', 'A', 'An', 'In', 'On', 'At'].includes(name)) continue;
        names[name] = (names[name] || 0) + 1;
    }

    Object.entries(names).forEach(([name, count]) => {
        const shouldSave = count >= 2 || newMemory[name];

        if (shouldSave) {
            const nameLower = name.toLowerCase();

            const ageDescPattern = new RegExp(`(\\d+[\\s-]year[\\s-]old[^,\\.]*\\b${nameLower}\\b[^,\\.]*)`, 'i');
            const ageMatch = generatedPrompt.match(ageDescPattern);

            const contextPattern = new RegExp(`([^,\\.]{10,80}\\b${nameLower}\\b[^,\\.]{10,80})`, 'i');
            const contextMatch = generatedPrompt.match(contextPattern);

            const clothingPattern = new RegExp(`(${nameLower}[^,\\.]*(?:wearing|in a|in an|with)[^,\\.]{10,50})`, 'i');
            const clothingMatch = generatedPrompt.match(clothingPattern);

            let bestDescription = null;
            if (ageMatch && ageMatch[1]) bestDescription = ageMatch[1].trim();
            else if (clothingMatch && clothingMatch[1]) bestDescription = clothingMatch[1].trim();
            else if (contextMatch && contextMatch[1]) bestDescription = contextMatch[1].trim();

            if (bestDescription) {
                if (!newMemory[name] || bestDescription.length > newMemory[name].length) {
                    newMemory[name] = bestDescription;
                }
            }
        }
    });

    return newMemory;
}

/**
 * Generate image prompt from scene text using Claude API
 */
export async function generateImagePrompt(sceneText, sceneIndex, styleName, characterMemory) {
    try {
        const prompt = `You are an expert at creating ULTRA-DETAILED, ACCURATE image prompts for ${styleName} style.

SCENE ${sceneIndex + 1} TEXT:
${sceneText}

${Object.keys(characterMemory).length > 0 ? `
PREVIOUS CHARACTERS (keep consistent):
${Object.entries(characterMemory).map(([name, desc]) => `${name}: ${desc}`).join('\n')}
` : ''}

Create a detailed image prompt (55-75 words) that accurately represents this scene, including all characters, their interactions, the setting, and key visual details. Match emotions, colors, actions, and props exactly as described in the scene text.

Output ONLY the final prompt - no analysis or additional text.`;

        const response = await generateImagePromptAPI(prompt, 1000);

        let imagePrompt = '';
        if (response.content && response.content[0] && response.content[0].text) {
            imagePrompt = response.content[0].text;
        } else if (typeof response === 'string') {
            imagePrompt = response;
        } else {
            throw new Error('Invalid response format from image prompt API');
        }

        imagePrompt = imagePrompt.replace(/^["']|["']$/g, '').trim();

        // Cleanup logic (simplified from original)
        imagePrompt = imagePrompt.split('\n').filter(line => !line.startsWith('**') && line.trim() !== '').join(' ');

        if (!imagePrompt.includes('(no visible text)')) {
            imagePrompt = imagePrompt.replace(/,?\s*(cinematic composition|photorealistic style|sharp details).*$/i, '');
            imagePrompt = imagePrompt.trim() + ', professional photography, studio lighting, high resolution 8K, sharp focus on faces, vivid colors, high contrast, dramatic lighting, cinematic composition, photorealistic style, commercial photography quality, crystal clear image (no visible text)';
        }

        return imagePrompt;
    } catch (error) {
        console.warn('Claude prompt generation failed, using fallback:', error);
        return `A realistic photograph of ${sceneText.substring(0, 100)}...`;
    }
}

/**
 * Call Ideogram API to generate image
 */
export async function callIdeogramAPI(prompt, settings) {
    let renderingSpeed = 'TURBO';
    if (settings.quality === 'better') renderingSpeed = 'DEFAULT';
    if (settings.quality === 'best') renderingSpeed = 'QUALITY';

    const styleType = getIdeogramStyleType(settings.style?.name || 'Realistic');

    // Retry logic
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
        try {
            const data = await generateImage(
                prompt,
                settings.aspectRatio || '16:9',
                renderingSpeed,
                styleType
            );

            if (data.data && data.data[0] && data.data[0].url) {
                return data.data[0].url;
            } else {
                throw new Error('No image URL found in Ideogram response');
            }
        } catch (error) {
            retryCount++;
            if (retryCount >= maxRetries) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
        }
    }
}
