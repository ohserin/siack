import React, {createContext, useContext, useState, useEffect, useCallback} from 'react';
import {getCookie, removeCookie, setCookie} from '../utils/cookie';
import api from "../api/api.js";
import axios from "axios";
import {navigate} from "../utils/navigation.js";

// 인증 상태를 관리할 Context 생성
const AuthContext = createContext();

const fetchUserDataFromAPI = async (token) => {
    try {
        const response = await api.get('/v1/userinfo/', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = response.data;

        if (data.statusCode === 200) {
            return {
                userId: data.userId,
                username: data.username,
                email: data.email,
                phone: data.phone,
                nickname: data.nickname,
                profileImg: data.profileImg,
                statusMessage: data.statusMessage,
                role: data.role,
            };
        } else {
            throw new Error(data.message || 'API 응답 상태가 성공이 아닙니다.');
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            console.error('사용자 정보 API 호출 에러 (응답):', error.response.data);
            throw new Error(error.response.data.message || '사용자 정보를 가져오는데 실패했습니다.');
        } else {
            console.error('사용자 정보 API 호출 에러:', error);
            throw new Error(error.message || '알 수 없는 오류가 발생했습니다.');
        }
    }
};

// 인증 상태를 앱 전체에 제공하는 Provider 컴포넌트
export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null); // 사용자 상태 (토큰 등) 저장
    const [userData, setUserData] = useState(null); // 사용자 상세 정보
    const [loading, setLoading] = useState(true); // 로딩 상태

    // 사용자 프로필 정보를 가져오는 함수
    const fetchUserProfile = useCallback(async (token) => {
        if (!token) {
            setUserData(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const profile = await fetchUserDataFromAPI(token);
            setUserData(profile);
        } catch (error) {
            logout();
        } finally {
            setLoading(false);
        }
    }, []);

    // 컴포넌트 마운트 시 실행 - 쿠키에 저장된 토큰이 있다면 사용자 상태로 설정
    useEffect(() => {
        const token = getCookie('authToken');
        if (token) {
            setUser({token});
            fetchUserProfile(token);
        } else {
            setLoading(false);
        }
    }, [fetchUserProfile]);

    // 로그인 시 토큰을 받아 사용자 상태 설정
    const login = useCallback(async (token) => {
        setCookie('authToken', token, {path: '/'}); // 쿠키에 토큰 저장
        setUser({token});
        await fetchUserProfile(token);
    }, [fetchUserProfile]);

    // 로그아웃 시 쿠키에서 토큰 제거하고 사용자 상태 및 프로필 정보 초기화
    const logout = useCallback(() => {
        removeCookie('authToken');
        setUser(null);
        setUserData(null);
    }, []);

    const guard = (isLoginRequired, redirectPath) => {
        const token = getCookie('authToken');
        const isLoggedIn = !!token;

        if (isLoggedIn !== isLoginRequired) {
            navigate(redirectPath);
        }
    };

    const getRoleLabel = () => {
        if (userData.role === 1) return '관리자';
        if (userData.role === 0) return '일반 사용자';
        return '알 수 없음';
    }

    // Context를 통해 하위 컴포넌트에 사용자 상태, 상세 정보, 로그인/로그아웃 함수, 로딩 상태 제공
    return (
        <AuthContext.Provider value={{user, userData, loading, login, logout, getRoleLabel, guard}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);