package com.dakgu.siack.log.service;

import com.dakgu.siack.log.dto.PageResponse;
import com.dakgu.siack.log.repository.UserLogRepository;
import com.dakgu.siack.log.vo.UserLog;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
@RequiredArgsConstructor
public class UserLogService {

    private final UserLogRepository userLogRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public void saveLog(UserLog userLog) {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();

        String clientIp = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        String region = getRegionFromIp(clientIp);

        userLog.setIp(clientIp);
        userLog.setUseragent(userAgent);
        userLog.setRegion(region);

        userLogRepository.save(userLog);
    }

    public PageResponse<UserLog> getLogsByUserId(int userid, Pageable pageable) {
        return new PageResponse<>(userLogRepository.findByUserid(userid, pageable));
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");

        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }

        return ip.split(",")[0];
    }

    private String getRegionFromIp(String ip) {
        if (ip.equals("127.0.0.1") || ip.equals("0:0:0:0:0:0:0:1")) {
            return "로컬 환경";
        }

        String url = "http://ip-api.com/json/" + ip;
        try {
            IpApiResponse response = restTemplate.getForObject(url, IpApiResponse.class);
            if (response != null && "success".equals(response.getStatus())) {
                return response.getRegionName();
            }
        } catch (Exception e) {
            System.err.println("IP-API 호출 실패: " + e.getMessage());
        }
        return "미확인 지역";
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class IpApiResponse {
        private String status;
        private String regionName;
    }
}
