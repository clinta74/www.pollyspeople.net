// ─────────────────────────────────────────────────────────────
//  Dog roster — story text and metadata only.
//  Photos are loaded at runtime from /dogs/manifest.json
//  so new images can be added without a rebuild.
// ─────────────────────────────────────────────────────────────

export interface Dog {
    /** Lower-case prefix used to match photo filenames, e.g. "polly" matches "polly-1.jpg" */
    key: string;
    name: string;
    breed: string;
    born: number;
    adopted: number;
    died?: number;
    bio: string;
}

export const DOGS: Dog[] = [
    {
        key: 'polly',
        name: 'Polly',
        breed: 'Black Labrador & Shepherd mix',
        born: 2010,
        adopted: 2010,
        died: 2023,
        bio: `She came to us in the winter of 2010, a foundling of shadow and wagging tail, born the
              same year she found her people. For thirteen winters Polly kept faithful watch — her
              dark coat a moving patch of night against whatever room she graced. She was patient
              where the world was hurried, warm where it ran cold. In the spring of 2023, when the
              masses in her stomach stole her ease, we made the hardest kindness and let her go.
              She is not gone. She is simply in the next room, waiting.`,
    },
    {
        key: 'pixie',
        name: 'Pixie',
        breed: 'Siberian Husky & American Bulldog Terrier mix',
        born: 2024,
        adopted: 2024,
        bio: `Born and adopted in the same year, Pixie arrived as though she had always meant to.
              She carries the warm brown of the Siberian wilderness in her coat and the stubborn
              brightness of a terrier in her eyes. She has already staked her claim on the warmest
              cushion, the loudest howl, and the largest portion of every heart in the house.`,
    },
    {
        key: 'mork',
        name: 'Mork',
        breed: 'American Shepherd, American Bulldog Terrier & assorted mutt',
        born: 2025,
        adopted: 2025,
        bio: `Mork arrived in 2025 in a whirlwind of ears too large for his head and opinions too
              numerous for his years. Shepherd, terrier, and something altogether his own — he
              regards the world with the philosophical suspicion of a creature certain that everything
              is edible until proven otherwise. He is, in short, a very good boy.`,
    },
];
