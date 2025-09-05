import {useState, useEffect, useRef} from 'react';
import {Container, Box, Tabs, Tab} from '@mui/material';
import ProfileSettings from './ProfileSettings';
import PasswordSettings from './PasswordSettings';
import LogHistorySettings from './LogHistorySettings.jsx';
import WithdrawalSettings from './WithdrawalSettings.jsx';
import {useAuth} from '../../../contexts/AuthContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

function UserSettingsPage() {
    const [currentTab, setCurrentTab] = useState(0);
    const {guard} = useAuth();
    const swiperRef = useRef(null);

    useEffect(() => {
        guard(true, '/');
    }, []);

    const handleSwiperSlideChange = (swiper) => {
        setCurrentTab(swiper.activeIndex);
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
        if (swiperRef.current) {
            swiperRef.current.slideTo(newValue);
        }
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
                <Tabs
                    value={currentTab}
                    onChange={handleTabChange}
                    aria-label="user settings tabs"
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label="프로필 설정"/>
                    <Tab label="비밀번호 변경"/>
                    <Tab label="로그 조회"/>
                    <Tab label="회원 탈퇴"/>
                </Tabs>
            </Box>
            <Swiper
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                onSlideChange={handleSwiperSlideChange}
                initialSlide={currentTab}
                spaceBetween={0}
                slidesPerView={1}
                style={{width: '100%'}}
            >
                <SwiperSlide>
                    <Container component="main" sx={{py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <Box sx={{width: '100%', maxWidth: getMaxWidth()}}>
                            <ProfileSettings/>
                        </Box>
                    </Container>
                </SwiperSlide>
                <SwiperSlide>
                    <Container component="main" sx={{py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <Box sx={{width: '100%', maxWidth: getMaxWidth()}}>
                            <PasswordSettings/>
                        </Box>
                    </Container>
                </SwiperSlide>
                <SwiperSlide>
                    <Container component="main" sx={{py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <Box sx={{width: '100%', maxWidth: getMaxWidth()}}>
                            <LogHistorySettings/>
                        </Box>
                    </Container>
                </SwiperSlide>
                <SwiperSlide>
                    <Container component="main" sx={{py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <Box sx={{width: '100%', maxWidth: getMaxWidth()}}>
                            <WithdrawalSettings/>
                        </Box>
                    </Container>
                </SwiperSlide>
            </Swiper>
        </Box>
    );
}

export default UserSettingsPage;
