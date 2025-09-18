import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, Tooltip, IconButton } from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import api from '../../../api/api';

function WorkspaceHeader({ channelName, onExit }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = useParams();
  const { userData } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(null);

  const handleExit = () => {
    if (onExit) onExit();
    else navigate('/');
  };

  const goSettings = () => {
    if (!roomId) return;
    if (!location.pathname.endsWith('/settings')) {
      navigate(`/workspace/room/${roomId}/settings`);
    }
  };

  useEffect(() => {
    let mounted = true;
    const uid = userData?.userid;
    if (!uid) { setAvatarUrl(null); return; }
    api.get('/v1/user/profileImg', { params: { userid: uid } })
      .then(res => { if (mounted) setAvatarUrl(res?.data?.url || null); })
      .catch(() => { if (mounted) setAvatarUrl(null); });
    return () => { mounted = false; };
  }, [userData?.userid]);

  const pickValid = (v) => (v && v !== 'null' && v !== 'undefined' && String(v).trim() !== '') ? v : undefined;
  const avatarSrc = pickValid(avatarUrl) || pickValid(userData?.profileimg) || undefined;
  const avatarFallback = userData?.nickname ? userData.nickname[0] : '?';

  return (
    <Box
      component="header"
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        py: 1,
        px: { xs: 1.5, md: 2 },
        bgcolor: 'primary.main',
        color: 'common.white',
        borderBottom: '1px solid',
        borderColor: 'primary.dark',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* 좌측: 둥근 사각형 아이콘(클릭 시 설정으로) + 채널명 */}
      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
        <Tooltip title="설정으로 이동" arrow>
          <Box
            role="button"
            tabIndex={0}
            onClick={goSettings}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') goSettings(); }}
            sx={{ width: 24, height: 24, borderRadius: '6px', bgcolor: 'common.white', mr: 1, opacity: 0.95, cursor: 'pointer' }}
          />
        </Tooltip>
        <Typography
          variant="h6"
          fontWeight={800}
          className="line-clamp-1"
          sx={{ minWidth: 0, color: 'inherit' }}
        >
          {channelName}
        </Typography>
      </Box>

      {/* 우측: 유저 아이콘 + 나가기 아이콘 버튼 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title={userData?.nickname || ''} arrow>
          <Avatar src={avatarSrc} alt={userData?.nickname || ''} sx={{ width: 30, height: 30, border: '1px solid rgba(255,255,255,0.5)' }}>
            {!avatarSrc && avatarFallback}
          </Avatar>
        </Tooltip>
        <Tooltip title="나가기" arrow>
          <IconButton color="inherit" onClick={handleExit} aria-label="나가기" sx={{ color: 'inherit' }}>
            <LogoutRoundedIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

export default WorkspaceHeader;
