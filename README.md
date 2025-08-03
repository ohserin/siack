## 🛠 개발 환경

### Backend
> **Java 17** <br>
> **Spring Boot 3.5.3** <br>
> **Gradle** <br>
> **JPA (Hibernate)** <br>
> **MySQL 8.0.33** <br>
> **Spring Security** <br>
> **JWT (jjwt 0.12.6)** <br>
> **Lombok** <br>
> **Embedded Tomcat (WAR 배포 구조)** <br>

### Frontend
> **React 19** <br>
> **Vite 7** <br>
> **Material UI (v7)** <br>
> **Emotion (CSS-in-JS)** <br>
> **React Hook Form** <br>
> **React Router v7** <br>
> **Axios** <br>

## 🛠️ Spring 프로젝트 데이터베이스 설정
### src/main/resources 경로에<br>application.datasource.properties 파일을 생성:
```properties
# application.datasource.properties
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://사용하는디비서버주소:3306/siack_db?serverTimezone=Asia/Seoul
spring.datasource.username=디비계정
spring.datasource.password=디비계정비밀번호
```

  
## 🛠️ React+Vite 빌드
```bash
# 프론트엔드 디렉터리로 이동
cd src/main/frontend

# 의존성 설치
npm install

# 개발 서버 실행 (Vite)
npm run dev

# 빌드 (정적 파일 생성)
npm run build
```
