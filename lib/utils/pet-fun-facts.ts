/*
 * Fun facts shown on the Snoof AI insight card when a pet doesn't yet have
 * enough logged data to generate a personalised insight (< 3 days of logs).
 *
 * Add as many as you like — the card rotates through them by day of year so
 * the user sees something fresh each day without any API call.
 *
 * Keep facts short (1-2 sentences), warm in tone, and dog-focused.
 * Add cat-specific facts here too once cat support is added, then filter by
 * pet species in the card component.
 */

export const DOG_FUN_FACTS: string[] = [
  // Senses & Biology
  "A dog's nose print is as unique as a human fingerprint — no two are alike.",
  "Dogs can learn over 165 words, signals, and gestures throughout their lifetime.",
  "A dog's sense of smell is 10,000 to 100,000 times more powerful than a human's.",
  "Dogs have three eyelids — the third is a nictitating membrane that keeps the eye moist and protected.",
  "A dog's normal body temperature runs between 101°F and 102.5°F — warmer than ours by about two degrees.",
  "Dogs can hear sounds at frequencies four times higher than humans can detect.",
  "A dog's wet nose helps it absorb scent chemicals, making smelling even more precise.",
  "Dogs have about 1,700 taste buds — humans have roughly 9,000, which is why they eat almost anything.",
  "A dog's heart beats between 60 and 140 times per minute depending on size — smaller dogs run faster.",
  "Dogs sweat through the pads of their paws, not through their skin.",

  // Behavior & Psychology
  "When dogs wag their tails to the right, it signals positive emotions; to the left, it signals anxiety.",
  "Dogs yawn to communicate stress or submission — not just sleepiness.",
  "Dogs dream during REM sleep, and smaller breeds tend to dream more frequently than larger ones.",
  "A dog that yawns right after you do is showing empathy — they're actually 'catching' your yawn.",
  "Dogs can read human emotions by looking at the left side of your face first, just like people do.",
  "Dogs have a specific brain region that responds to voices and processes emotional tone, just like humans.",
  "Eye contact between a dog and their owner triggers oxytocin release in both — the same hormone that bonds parents to babies.",
  "Dogs understand pointing as a communicative gesture — most other animals, including chimpanzees, don't.",
  "Play bowing (front legs stretched forward, rear end up) is a dog's way of saying 'I want to play, not fight.'",
  "A guilty-looking dog isn't actually feeling guilt — the expression is a response to your body language, not their actions.",

  // Health & Care
  "Regular tooth brushing is the single most effective way to prevent dental disease in dogs.",
  "Dogs should ideally have their teeth brushed every day — dental disease affects over 80% of dogs by age 3.",
  "A dog's paws can crack and burn on pavement above 125°F — if it's too hot for your hand, it's too hot for their paws.",
  "Senior dogs benefit from twice-yearly vet checkups rather than annual ones, since they age much faster than humans.",
  "Dogs need mental stimulation as much as physical exercise — a bored dog is often a destructive one.",
  "Overweight dogs live an average of 2.5 years less than dogs at a healthy weight.",
  "Blue-eyed dogs and dogs with white coats have a higher risk of congenital deafness.",
  "Omega-3 fatty acids from fish oil can significantly improve a dog's coat quality, joint health, and brain function.",
  "Dogs can get sunburned, especially on their nose, ears, and belly — dog-safe sunscreen is a real thing.",
  "Most dogs need 12–14 hours of sleep per day; puppies and seniors can need up to 18 hours.",

  // Training & Intelligence
  "The Border Collie is widely considered the most intelligent dog breed, capable of learning a new command in under five repetitions.",
  "Positive reinforcement training is scientifically proven to produce faster learning and fewer behavioral problems than punishment-based methods.",
  "Dogs learn by association — pairing a cue with a behavior consistently is more effective than repeating a command louder.",
  "Puppies have a critical socialization window between 3 and 14 weeks — experiences during this period shape behavior for life.",
  "Dogs are one of the few non-human animals that can follow a human's gaze to look at something in the distance.",
  "Service dogs can be trained to detect oncoming seizures, hypoglycemic episodes, and even some cancers by scent.",
  "Dogs can recognize themselves in a smell test (the olfactory equivalent of a mirror test), suggesting a form of self-awareness.",
  "Short, frequent training sessions of 5–10 minutes are more effective for dogs than one long session.",

  // Breed & Diversity
  "There are over 340 recognized dog breeds worldwide, spanning hundreds of years of selective breeding.",
  "The Basenji is the only dog breed that doesn't bark — it produces a yodel-like sound called a 'barroo.'",
  "Greyhounds can reach speeds up to 45 mph, making them the fastest dog breed on earth.",
  "The Labrador Retriever has been the most popular dog breed in the U.S. for over 30 consecutive years.",
  "Chow Chows and Shar-Peis are the only two dog breeds with black or blue-black tongues.",
  "The Norwegian Lundehund has six toes on each foot — it was bred to climb cliffs and hunt puffins.",

  // Ownership & Bond
  "Dog owners visit the doctor 15% less often than non-pet owners and have lower rates of depression and anxiety.",
  "Interacting with a dog for just 10 minutes can lower cortisol levels and increase serotonin in the brain.",
  "The average American dog owner spends over $1,500 per year on their dog, not including major medical events.",
  "Dogs are one of the only animals that actively seek out human eye contact as a form of bonding.",
  "Americans own approximately 90 million dogs, making the U.S. one of the highest dog-ownership countries in the world.",
];

/* Returns a fact that rotates daily so it feels fresh without an API call. */
export const getDailyFunFact = (facts: string[]): string => {
  if (facts.length === 0) {
    return "";
  }
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86_400_000,
  );
  return facts[dayOfYear % facts.length];
};
