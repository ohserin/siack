export function makeMockDMData() {
  const now = Date.now();
  const users = [
    { id: 'u1', name: '김창', avatar: '', color: '#F06292' },
    { id: 'u2', name: '허원', avatar: '', color: '#4FC3F7' },
    { id: 'u3', name: '이현', avatar: '', color: '#AED581' },
    { id: 'u4', name: '이수', avatar: '', color: '#FFD54F' },
  ];
  const you = { id: 'me', name: '나', avatar: '' };

  const conversations = users.map((u, idx) => ({
    id: `c${idx + 1}`,
    user: u,
    unread: idx % 2 === 0 ? (idx + 1) : 0,
    lastMessageAt: now - (idx + 1) * 1000 * 60 * 42,
    snippet: idx % 2
      ? '내일까지 자료 검토해서 공유드릴게요.'
      : '오늘 점심은 뭐 드실래요? 근처 신상 맛집 발견!'
  }));

  const messagesByCid = Object.fromEntries(
    conversations.map((c, i) => [
      c.id,
      [
        {
          id: `${c.id}-m1`,
          sender: c.user,
          text: `${c.user.name} 님과의 DM 예시입니다. 반가워요!`,
          time: now - 1000 * 60 * (60 + i * 3)
        },
        {
          id: `${c.id}-m2`,
          sender: you,
          text: '안녕하세요! 오늘 일정 공유 좀 부탁드려요 🙏',
          time: now - 1000 * 60 * (45 + i * 2)
        },
        {
          id: `${c.id}-m3`,
          sender: c.user,
          text: '넵! 3시에 회의 있고, 5시에 문서 드릴게요.',
          time: now - 1000 * 60 * (30 + i)
        },
      ]
    ])
  );

  return { you, conversations, messagesByCid };
}

