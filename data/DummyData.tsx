import { PlannedWalk } from '../types/PlannedWalk';
import { UserDetails } from '../types/UserDetails';
import { ChatMessage } from '../types/ChatMessage';

export const plannedWalks: PlannedWalk[] = [
  {
    id: '1',
    dateTime: '2024-12-05T09:00',
    location: 'Golden Gate Park',
    description: 'A nice place to walk.',
    duration: 0.5,
    userId: 1,
    username: 'John Doe',
    fullName: 'John Doe',
    profileImage: 'https://cdn.britannica.com/92/212692-050-D53981F5/labradoodle-dog-stick-running-grass.jpg',
    lastMessageDate: '2024-12-01T09:00',
    lastDateMessagesChecked: '2024-12-01T09:00',
    latitude: 37.7694,
    longitude: -122.4862,
    maxParticipants: 5,
    joinedUserIds: [1, 2],
    invitedUserIds: [1, 2],
    cancelled: false,
  },
  {
    id: '2',
    dateTime: '2024-12-04T14:30',
    location: 'Fisherman\'s Wharf',
    description: 'A nice place to walk.',
    duration: 0.75,
    userId: 2,
    username: 'Jane Smith',
    fullName: 'Jane Smith',
    profileImage: 'https://discoverymood.com/wp-content/uploads/2020/04/Mental-Strong-Women-min.jpg',
    lastMessageDate: '2024-12-01T09:00',
    lastDateMessagesChecked: '2024-12-01T08:00',
    latitude: 37.8080,
    longitude: -122.4177,
    maxParticipants: 5,
    joinedUserIds: [2, 3, 4, 5],
    invitedUserIds: [1, 2, 5],
    cancelled: false,
  },
  {
    id: '3',
    dateTime: '2024-12-04T10:00',
    location: 'Alamo Square',
    description: 'A scenic walk with a view of the city.',
    duration: 1.0,
    userId: 3,
    username: 'Carlos Silva',
    fullName: 'Carlos Silva',
    profileImage: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Mn_roy2.jpg',
    lastMessageDate: '2024-12-01T09:00',
    lastDateMessagesChecked: '2024-12-01T09:00',
    latitude: 37.7764,
    longitude: -122.4346,
    maxParticipants: 10,
    joinedUserIds: [3, 4],
    invitedUserIds: [1, 2, 5],
    cancelled: false,
  },
  {
    id: '4',
    dateTime: '2024-12-05T16:00',
    location: 'Presidio of San Francisco',
    description: 'A walk through the beautiful gardens of Serralves.',
    duration: 1.5,
    userId: 4,
    username: 'Ana Costa',
    fullName: 'Ana Costa',
    profileImage: 'https://static01.nyt.com/images/2021/01/17/arts/wonderwoman1984-anatomy1/wonderwoman1984-anatomy1-videoSixteenByNine3000-v2.jpg',
    lastMessageDate: '2024-12-01T09:00',
    lastDateMessagesChecked: '2024-12-01T09:00', 
    latitude: 37.7989,
    longitude: -122.4662,
    maxParticipants: 8,
    joinedUserIds: [4, 5],
    invitedUserIds: [1, 2, 3, 5],
    cancelled: false,
  },
  {
    id: '5',
    dateTime: '2024-12-06T11:00',
    location: 'Ocean Beach',
    description: 'A refreshing walk along the coast.',
    duration: 2.0,
    userId: 5,
    username: 'Miguel Oliveira',
    fullName: 'Miguel Oliveira',
    profileImage: 'https://t4.ftcdn.net/jpg/02/24/86/95/240_F_224869519_aRaeLneqALfPNBzg0xxMZXghtvBXkfIA.jpg',
    lastMessageDate: '2024-12-01T09:00',
    lastDateMessagesChecked: '2024-12-01T09:00', 
    latitude: 37.7597,
    longitude: -122.4782,
    maxParticipants: 12,
    joinedUserIds: [5, 1],
    invitedUserIds: [1, 2, 3, 4],
    cancelled: false,
  },
  {
    id: '6',
    dateTime: '2024-12-07T09:30',
    location: 'Lands End',
    description: 'A walk with stunning views of the Pacific Ocean.',
    duration: 1.5,
    userId: 3,
    username: 'Emily Clark',
    fullName: 'Emily Clark',
    profileImage: 'https://t4.ftcdn.net/jpg/02/24/86/95/240_F_224869519_aRaeLneqALfPNBzg0xxMZXghtvBXkfIA.jpg',
    lastMessageDate: '2024-12-05T09:00',
    lastDateMessagesChecked: '2024-12-05T09:00',
    latitude: 37.7841,
    longitude: -122.5135,
    maxParticipants: 10,
    joinedUserIds: [3],
    invitedUserIds: [1, 2, 5],
    cancelled: false,
  },
  {
    id: '7',
    dateTime: '2024-12-07T15:00',
    location: 'Twin Peaks',
    description: 'A challenging walk with rewarding views of the city.',
    duration: 2.0,
    userId: 4,
    username: 'David Lee',
    fullName: 'David Lee',
    profileImage: 'https://t4.ftcdn.net/jpg/02/24/86/95/240_F_224869519_aRaeLneqALfPNBzg0xxMZXghtvBXkfIA.jpg',
    lastMessageDate: '2024-12-06T15:00',
    lastDateMessagesChecked: '2024-12-06T15:00',
    latitude: 37.7544,
    longitude: -122.4477,
    maxParticipants: 8,
    joinedUserIds: [4],
    invitedUserIds: [1, 2, 3, 5],
    cancelled: false,
  },
];

export const userDetails: UserDetails[] = [
  {
    id: 1,
    userName: 'john',
    fullName: 'John Doe',
    activeSince: '2024-12-01T09:00',
    bio: 'A passionate walker and nature enthusiast, John has been exploring trails and parks for over a decade. With a keen interest in botany and wildlife, he often shares his knowledge with fellow walkers. John believes in the therapeutic power of nature and enjoys organizing community walks to promote wellness and environmental awareness.',
    profileImage: 'https://cdn.britannica.com/92/212692-050-D53981F5/labradoodle-dog-stick-running-grass.jpg',
    walksCompleted: 10,
    rating: 4.5,
    numberOfRatings: 20,
  },
  {
    id: 2,
    userName: 'jane',
    fullName: 'Jane Smith',
    walksCompleted: 10,
    activeSince: '2024-12-01T09:00',
    bio: 'Jane is a nature lover who enjoys hiking and exploring the great outdoors. She is passionate about sustainability and is always looking for ways to reduce her carbon footprint. Jane is also a keen photographer and loves capturing the beauty of nature through her lens.',
    profileImage: 'https://discoverymood.com/wp-content/uploads/2020/04/Mental-Strong-Women-min.jpg',
    rating: 4.7,
    numberOfRatings: 15,
  },
  {
    id: 3,
    userName: 'carlos',
    fullName: 'Carlos Silva',
    activeSince: '2024-12-01T09:00',
    bio: 'Carlos is an avid hiker and enjoys discovering new trails. He is a fitness enthusiast and often combines his love for walking with his workout routines.',
    profileImage: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Mn_roy2.jpg',
    walksCompleted: 15,
    rating: 4.8,
    numberOfRatings: 25,
  },
  {
    id: 4,
    userName: 'ana',
    fullName: 'Ana Costa',
    activeSince: '2024-12-01T09:00',
    bio: 'Ana loves the tranquility of nature and often goes for walks to clear her mind. She is also a yoga instructor and incorporates walking into her wellness practices.',
    profileImage: 'https://static01.nyt.com/images/2021/01/17/arts/wonderwoman1984-anatomy1/wonderwoman1984-anatomy1-videoSixteenByNine3000-v2.jpg',
    walksCompleted: 8,
    rating: 4.6,
    numberOfRatings: 18,
  },
  {
    id: 5,
    userName: 'miguel',
    fullName: 'Miguel Oliveira',
    activeSince: '2024-12-01T09:00',
    bio: 'Miguel is a coastal walker who enjoys the sound of the waves and the fresh sea breeze. He is a marine biologist and often shares interesting facts about marine life during his walks.',
    profileImage: 'https://t4.ftcdn.net/jpg/02/24/86/95/240_F_224869519_aRaeLneqALfPNBzg0xxMZXghtvBXkfIA.jpg',
    walksCompleted: 20,
    rating: 4.9,
    numberOfRatings: 30,
  },
];


export const walkingQuotes: string[] = [
  "Walking is the best possible exercise. Habituate yourself to walk very far. \n\n- Thomas Jefferson",
  "An early-morning walk is a blessing for the whole day. \n\n- Henry David Thoreau",
  "Walking is man's best medicine. \n\n- Hippocrates",
  "All truly great thoughts are conceived while walking. \n\n- Friedrich Nietzsche",
  "The journey of a thousand miles begins with one step. \n\n- Lao Tzu",
  "I have two doctors, my left leg and my right. \n\n- G.M. Trevelyan",
  "Everywhere is within walking distance if you have the time. \n\n- Steven Wright",
  "Walking: the most ancient exercise and still the best modern exercise. \n\n- Carrie Latet",
  "The best remedy for a short temper is a long walk. \n\n- Jacqueline Schiff",
  "Walking is a man's best medicine. \n\n- Hippocrates",
  "Walking is a man's best friend. \n\n- Unknown",
  "The best way to lengthen out our days is to walk steadily and with a purpose. \n\n- Charles Dickens",
  "Walking is the perfect way of moving if you want to see into the life of things. \n\n- Elizabeth von Arnim",
  "A walk in nature walks the soul back home. \n\n- Mary Davis",
  "Walking is the great adventure, the first meditation, a practice of heartiness and soul primary to humankind. \n\n- Gary Snyder",
  "Walking is a virtue, tourism is a deadly sin. \n\n- Bruce Chatwin",
  "The best thoughts most often come while walking. \n\n- Friedrich Nietzsche",
  "Walking is the exact balance between spirit and humility. \n\n- Gary Snyder",
  "A walk in the woods is a return to the soul. \n\n- Unknown",
  "Walking is the ultimate form of transportation. \n\n- Unknown",
];

export const chatMessages: ChatMessage[] = [
  {
    id: '1',
    walkId: '1',
    userId: 1,
    userName: 'john',
    message: 'Looking forward to this walk!',
    timestamp: '2024-11-30T18:00',
    newMessage: false,
  },
  {
    id: '2',
    walkId: '1',
    userId: 2,
    userName: 'jane',
    message: 'Me too! The weather looks great.',
    timestamp: '2024-11-30T18:05',
    newMessage: false,
  },
  {
    id: '3',
    walkId: '2',
    userId: 3,
    userName: 'carlos',
    message: 'Can’t wait to explore Fisherman\'s Wharf!',
    timestamp: '2024-12-01T10:00',
    newMessage: false,
  },
  {
    id: '4',
    walkId: '3',
    userId: 4,
    userName: 'ana',
    message: 'Alamo Square has the best views.',
    timestamp: '2024-12-02T09:00',
    newMessage: false,
  },
  {
    id: '5',
    walkId: '4',
    userId: 5,
    userName: 'miguel',
    message: 'Presidio of San Francisco is beautiful this time of year.',
    timestamp: '2024-12-03T15:00',
    newMessage: false,
  },
  {
    id: '6',
    walkId: '5',
    userId: 1,
    userName: 'miguel',
    message: 'Ocean Beach is my favorite coastal walk.',
    timestamp: '2024-12-04T10:00',
    newMessage: false,
  },
  {
    id: '7',
    walkId: '1',
    userId: 3,
    userName: 'carlos',
    message: 'I hope we can spot some interesting birds at the park.',
    timestamp: '2024-11-30T18:10',
    newMessage: false,
  },
  {
    id: '8',
    walkId: '2',
    userId: 4,
    userName: 'ana',
    message: 'I heard there’s a new café opening nearby. Maybe we can check it out after the walk.',
    timestamp: '2024-12-01T10:15',
    newMessage: false,
  },
  {
    id: '9',
    walkId: '3',
    userId: 5,
    userName: 'miguel',
    message: 'I’ll bring my camera to capture the views.',
    timestamp: '2024-12-02T09:15',
    newMessage: false,
  },
  {
    id: '10',
    walkId: '4',
    userId: 1,
    userName: 'john',
    message: 'Looking forward to seeing the gardens in full bloom.',
    timestamp: '2024-12-03T15:10',
    newMessage: false,
  },
  {
    id: '11',
    walkId: '5',
    userId: 2,
    userName: 'jane',
    message: 'The sound of the waves is so calming.',
    timestamp: '2024-12-04T10:15',
    newMessage: false,
  },
  {
    id: '12',
    walkId: '1',
    userId: 5,
    userName: 'miguel',
    message: 'I’ll bring some snacks for everyone.',
    timestamp: '2024-11-30T18:20',
    newMessage: false,
  },
  {
    id: '13',
    walkId: '2',
    userId: 1,
    userName: 'john',
    message: 'I’ve heard Fisherman\'s Wharf is beautiful this time of year.',
    timestamp: '2024-12-01T10:30',
    newMessage: false,
  },
  {
    id: '14',
    walkId: '3',
    userId: 2,
    userName: 'jane',
    message: 'I’m excited to see the city from Alamo Square.',
    timestamp: '2024-12-02T09:30',
    newMessage: false,
  },
  {
    id: '15',
    walkId: '4',
    userId: 3,
    userName: 'carlos',
    message: 'I’ll bring my yoga mat for some stretches in the park.',
    timestamp: '2024-12-03T15:20',
    newMessage: false,
  },
  {
    id: '16',
    walkId: '5',
    userId: 4,
    userName: 'ana',
    message: 'I love the fresh sea breeze at Ocean Beach.',
    timestamp: '2024-12-04T10:30',
    newMessage: false,
  },
];



