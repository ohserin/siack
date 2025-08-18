import {
    Box,
    Drawer,
    List,
    ListItemButton,
    ListItemText
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

// 사이드바 컴포넌트
function Sidebar({ open, onClose }) {
    // 사이드바 메뉴 항목들
    const drawerContent = (
        <Box
            sx={{ width: 250 }} // 사이드바 너비 설정
            role="presentation"
            onClick={onClose} // 사이드바 영역 클릭 시 닫힘
            onKeyDown={onClose} // 키보드 이벤트 발생 시 닫힘
        >
            <List>
                {/* 각 메뉴 항목은 react-router-dom의 Link로 라우팅됩니다 */}
                <ListItemButton component={RouterLink} to="/service">
                    <ListItemText primary="서비스" />
                </ListItemButton>
                <ListItemButton component={RouterLink} to="/pricing">
                    <ListItemText primary="요금제" />
                </ListItemButton>
                <ListItemButton component={RouterLink} to="/contact">
                    <ListItemText primary="문의" />
                </ListItemButton>
            </List>
        </Box>
    );

    return (
        <Drawer
            anchor="left" // 사이드바가 왼쪽에서 나타남
            open={open} // 열림 상태
            onClose={onClose} // 닫힘 이벤트 핸들러
        >
            {drawerContent}
        </Drawer>
    );
}

export default Sidebar;
