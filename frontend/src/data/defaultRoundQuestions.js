export const DEFAULT_APTITUDE_QUESTIONS = [
  { id: 'apt-default-0', question: 'A train travels 120 km in 2 hrs. Find speed.', options: ['50 km/h', '60 km/h', '70 km/h', '80 km/h'], category: 'Quantitative', difficulty: 'Easy' },
  { id: 'apt-default-1', question: 'Next in series: 2, 6, 12, 20, 30, ?', options: ['40', '42', '44', '46'], category: 'Pattern', difficulty: 'Easy' },
  { id: 'apt-default-2', question: 'A does work in 10 days, B in 15. Together?', options: ['5 days', '6 days', '7 days', '8 days'], category: 'Work & Time', difficulty: 'Medium' },
  { id: 'apt-default-3', question: 'What is 15% of 240?', options: ['32', '36', '38', '40'], category: 'Percentage', difficulty: 'Easy' },
  { id: 'apt-default-4', question: 'Odd one out: Apple, Mango, Potato, Grape', options: ['Apple', 'Mango', 'Potato', 'Grape'], category: 'Verbal', difficulty: 'Easy' },
  { id: 'apt-default-5', question: '5 machines → 5 items in 5 min. 100 machines → 100 items in?', options: ['1 min', '5 min', '10 min', '100 min'], category: 'Logical', difficulty: 'Hard' },
  { id: 'apt-default-6', question: 'Fibonacci: 1, 1, 2, 3, 5, 8, ?', options: ['11', '12', '13', '14'], category: 'Pattern', difficulty: 'Easy' },
  { id: 'apt-default-7', question: 'CP = ₹800, Profit = 20%. SP?', options: ['₹900', '₹960', '₹980', '₹1000'], category: 'Profit & Loss', difficulty: 'Easy' },
  { id: 'apt-default-8', question: 'All roses are flowers. Some flowers fade. Therefore:', options: ['All roses fade', 'Some roses may fade', 'No roses fade', 'Cannot determine'], category: 'Logical', difficulty: 'Medium' },
  { id: 'apt-default-9', question: '40L mixture, milk:water = 3:1. Litres of milk?', options: ['25 L', '30 L', '35 L', '28 L'], category: 'Ratio', difficulty: 'Medium' },
];

export const DEFAULT_TECHNICAL_PROBLEMS = [
  {
    id: 'tech-default-0',
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'HashMap'],
    description: 'Given array nums and integer target, return indices of two numbers that add to target. Exactly one solution exists.',
    examples: [
      { input: 'nums=[2,7,11,15], target=9', output: '[0,1]' },
      { input: 'nums=[3,2,4], target=6', output: '[1,2]' },
    ],
    starterCode: 'public int[] twoSum(int[] nums, int target) {\n  // Your solution here\n  \n}',
    hint: 'Use a HashMap. For each element, check if (target - element) exists in the map.',
    oopsConcept: 'Encapsulation: logic encapsulated in one method. Uses Map interface (Polymorphism via Java Collections).',
  },
  {
    id: 'tech-default-1',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    tags: ['String', 'Two Pointer'],
    description: 'After lowercasing and removing non-alphanumeric chars, check if string reads same forward and backward.',
    examples: [
      { input: 's="A man, a plan, a canal: Panama"', output: 'true' },
      { input: 's="race a car"', output: 'false' },
    ],
    starterCode: 'public boolean isPalindrome(String s) {\n  // Your solution here\n  \n}',
    hint: 'Two pointers from both ends. Skip non-alphanumeric chars. Compare lowercase.',
    oopsConcept: 'Abstraction: complex character-level logic hidden inside a clean boolean method signature.',
  },
  {
    id: 'tech-default-2',
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    tags: ['Array', 'DP', "Kadane's"],
    description: 'Find the contiguous subarray with the largest sum and return its sum.',
    examples: [
      { input: 'nums=[-2,1,-3,4,-1,2,1,-5,4]', output: '6' },
      { input: 'nums=[1]', output: '1' },
    ],
    starterCode: 'public int maxSubArray(int[] nums) {\n  // Your solution here\n  \n}',
    hint: 'Kadane\'s Algorithm: at each index, extend current subarray OR start fresh with current element.',
    oopsConcept: 'Single Responsibility Principle (SRP): one method, one job — compute maximum subarray sum.',
  },
];

export const DEFAULT_BEHAVIORAL_QUESTIONS = [
  { id: 'beh-default-0', question: 'Tell me about yourself and what drives you toward this role.', category: 'Self-Introduction', videoDurationSeconds: 120, difficulty: 'Easy', description: '' },
  { id: 'beh-default-1', question: 'Describe a challenging technical project. What was your approach and outcome?', category: 'Technical Experience', videoDurationSeconds: 120, difficulty: 'Medium', description: '' },
  { id: 'beh-default-2', question: 'Where do you see yourself professionally in 5 years?', category: 'Goals', videoDurationSeconds: 120, difficulty: 'Easy', description: '' },
  { id: 'beh-default-3', question: 'Tell me about a conflict with a team member and how you resolved it.', category: 'Conflict Resolution', videoDurationSeconds: 120, difficulty: 'Medium', description: '' },
  { id: 'beh-default-4', question: 'What are your strongest technical skills and what areas are you actively improving?', category: 'Self-Awareness', videoDurationSeconds: 120, difficulty: 'Easy', description: '' },
  { id: 'beh-default-5', question: 'Why should we hire you over other qualified candidates?', category: 'Value Proposition', videoDurationSeconds: 120, difficulty: 'Medium', description: '' },
];
