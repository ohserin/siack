import {useState, useEffect} from 'react';
import {Container, Box, Tabs, Tab} from '@mui/material';
import ProfileSettings from './ProfileSettings';
import PasswordSettings from './PasswordSettings';
import LogHistorySettings from './LogHistorySettings.jsx';
import WithdrawalSettings from './WithdrawalSettings.jsx';
import {useAuth} from '../../../contexts/AuthContext';

function UserSettingsPage() {
    const [currentTab, setCurrentTab] = useState(0);
    const {guard} = useAuth();

    useEffect(() => {
        guard(true, '/');
    }, []);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    // 탭에 따라 다른 최대 너비 설정
    const getMaxWidth = () => {
        switch (currentTab) {
            case 2:
                return 'md';
            case 3:
                return 400;
            default:
                return 500;
        }
    };

    return (
        <Box sx={{width: '100%'}}>
            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                <Tabs value={currentTab} onChange={handleTabChange} aria-label="user settings tabs">
                    <Tab label="프로필 설정"/>
                    <Tab label="비밀번호 변경"/>
                    <Tab label="로그 조회"/>
                    <Tab label="회원 탈퇴"/>
                </Tabs>
            </Box>
            <Container component="main" sx={{py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Box sx={{width: '100%', maxWidth: getMaxWidth()}}>
                    {currentTab === 0 && <ProfileSettings/>}
                    {currentTab === 1 && <PasswordSettings/>}
                    {currentTab === 2 && <LogHistorySettings/>}
                    {currentTab === 3 && <WithdrawalSettings/>}
                </Box>
            </Container>
        </Box>
    );
}

export default UserSettingsPage;
