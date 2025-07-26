import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCookie, removeCookie } from '../utils/cookie';

// 인증 상태를 관리할 Context 생성
const AuthContext = createContext();

// 인증 상태를 앱 전체에 제공하는 Provider 컴포넌트
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // 사용자 상태 (토큰 등) 저장

    // 컴포넌트 마운트 시 실행 - 쿠키에 저장된 토큰이 있다면 사용자 상태로 설정
    useEffect(() => {
        const token = getCookie('authToken');
        if (token) {
            setUser({ token });
        }
    }, []);

    // 로그인 시 토큰을 받아 사용자 상태 설정
    const login = (token) => {
        setUser({ token });
    };

    // 로그아웃 시 쿠키에서 토큰 제거하고 사용자 상태 초기화
    const logout = () => {
        removeCookie('authToken');
        setUser(null);
    };

    // Context를 통해 하위 컴포넌트에 사용자 상태와 로그인/로그아웃 함수 제공
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);