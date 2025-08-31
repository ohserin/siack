import {useState, useEffect} from 'react';
import {Container, Box, Tabs, Tab} from '@mui/material';
import ProfileSettings from './ProfileSettings';
import PasswordSettings from './PasswordSettings';
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

    return (
        <Box sx={{width: '100%'}}>
            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                <Tabs value={currentTab} onChange={handleTabChange} aria-label="user settings tabs">
                    <Tab label="프로필 설정"/>
                    <Tab label="비밀번호 변경"/>
                </Tabs>
            </Box>
            <Container component="main" sx={{py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Box sx={{width: '100%', maxWidth: 500}}>
                    {currentTab === 0 && <ProfileSettings/>}
                    {currentTab === 1 && <PasswordSettings/>}
                </Box>
            </Container>
        </Box>
    );
}

export default UserSettingsPage;
