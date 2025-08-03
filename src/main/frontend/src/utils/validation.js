import api from "../api/api.js";

const regexPatterns = {
    username: /^[a-zA-Z0-9_@]{4,50}$/, // 4~50자, 영문/숫자/특수문자(_, @) 포함
    // 비밀번호는 최소 8자 이상, 최소 하나의 소문자와 숫자를 포함
    password: /^(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // 일반적인 이메일 형식
    phone: /^\d{3}-\d{3,4}-\d{4}$/, // 000-0000-0000 또는 000-000-0000 형식
    nickname: /^[a-zA-Z0-9가-힣_]{2,30}$/
};

export function regexTest(type, value) {
    const pattern = regexPatterns[type];
    if (!pattern) return false;
    return pattern.test(value);
}

export async function checkDuplicate(field, value) {
    try {
        await api.get(`/v1/user/check-${field}`, { params: { [field]: value } });
        return 200;
    } catch (error) {
        return error.response?.status;
    }
}