import { PlannedWalk } from '../types/PlannedWalk';
import { UserDetails } from '../types/UserDetails';
export const plannedWalks: PlannedWalk[] = [
  {
    id: '1',
    date: '2024-12-01',
    time: '09:00',
    location: 'Parque da Cidade do Porto',
    description: 'A nice place to walk.',
    duration: 0.5,
    userId: 1,
    username: 'John Doe',
    fullName: 'John Doe',
    profileImage: 'https://en.wiktionary.org/wiki/kitty#/media/File:Stray_kitten_Rambo002.jpg',
    hasNewMessages: false,
    latitude: 41.1678,
    longitude: -8.6850,
    joinedParticipants: 1,
    maxParticipants: 5,
  },
  {
    id: '2',
    date: '2024-12-02',
    time: '14:30',
    location: 'Ribeira',
    description: 'A nice place to walk.',
    duration: 0.75,
    userId: 2,
    username: 'Jane Smith',
    fullName: 'Jane Smith',
    profileImage: 'https://en.wiktionary.org/wiki/kitty#/media/File:Stray_kitten_Rambo002.jpg',
    hasNewMessages: true,
    latitude: 41.1406,
    longitude: -8.6110,
    joinedParticipants: 1,
    maxParticipants: 5,
  },
];

export const userDetails: UserDetails[] = [
  {
    id: 1,
    userName: 'john',
    fullName: 'John Doe',
    bio: 'A passionate walker and nature enthusiast, John has been exploring trails and parks for over a decade. With a keen interest in botany and wildlife, he often shares his knowledge with fellow walkers. John believes in the therapeutic power of nature and enjoys organizing community walks to promote wellness and environmental awareness.',
    profileImage: 'https://en.wiktionary.org/wiki/kitty#/media/File:Stray_kitten_Rambo002.jpg',
  },
  {
    id: 2,
    userName: 'jane',
    fullName: 'Jane Smith',
    bio: 'Jane is a nature lover who enjoys hiking and exploring the great outdoors. She is passionate about sustainability and is always looking for ways to reduce her carbon footprint. Jane is also a keen photographer and loves capturing the beauty of nature through her lens.',
    profileImage: 'https://en.wiktionary.org/wiki/kitty#/media/File:Stray_kitten_Rambo002.jpg',
  },
];
