# Supabase 集成指南

## 1. 概述

本项目使用 Supabase 作为后端数据库和认证服务，本文档提供了 Supabase 与 Spring Boot 项目集成的详细指南。

## 2. Supabase 服务介绍

Supabase 是一个开源的 Firebase 替代品，提供以下核心服务：

- **PostgreSQL 数据库**: 功能强大的关系型数据库
- **认证服务 (Auth)**: 用户注册、登录、密码重置等功能
- **存储服务 (Storage)**: 文件上传和管理
- **实时订阅 (Realtime)**: 数据变更的实时通知
- **边缘函数 (Edge Functions)**: 无服务器函数

本项目主要使用 Supabase 的 PostgreSQL 数据库和认证服务。

## 3. Supabase 项目配置

### 3.1 项目信息

- **项目名称**: Campus_recruitment
- **项目 ID**: sdjbvotskfssjxgzemlw
- **区域**: ap-southeast-1 (新加坡)
- **数据库 URL**: https://sdjbvotskfssjxgzemlw.supabase.co
- **API URL**: https://sdjbvotskfssjxgzemlw.supabase.co/rest/v1/

### 3.2 访问凭证

在 Spring Boot 应用程序中配置以下环境变量或在 `application.yml` 中设置：

```yaml
supabase:
  url: https://sdjbvotskfssjxgzemlw.supabase.co
  key: ${SUPABASE_KEY} # 服务端密钥，请从 Supabase 项目设置中获取
  anon-key: ${SUPABASE_ANON_KEY} # 匿名密钥，用于公开访问
```

**注意**: 服务端密钥具有完全访问权限，请妥善保管，不要在客户端代码中使用。

## 4. 数据库集成

### 4.1 JDBC 连接配置

在 `application.yml` 中配置 PostgreSQL 数据库连接：

```yaml
spring:
  datasource:
    url: jdbc:postgresql://db.sdjbvotskfssjxgzemlw.supabase.co:5432/postgres
    username: postgres
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 5
      minimum-idle: 1
      connection-timeout: 30000
```

### 4.2 MyBatis-Plus 配置

```yaml
mybatis-plus:
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
  global-config:
    db-config:
      id-type: auto
      table-underline: true
```

## 5. 认证服务集成

### 5.1 认证方式

本项目采用双重认证方案：

1. **自建认证**: 使用 Spring Security + JWT 实现标准认证流程
2. **Supabase Auth**: 集成 Supabase 认证服务，提供邮箱验证、密码重置等功能

### 5.2 Supabase Auth API 调用

使用 OkHttp 或 RestTemplate 调用 Supabase Auth API：

```java
@Service
public class SupabaseAuthService {
    
    private final String supabaseUrl;
    private final String supabaseKey;
    private final OkHttpClient httpClient;
    
    public SupabaseAuthService(@Value("${supabase.url}") String supabaseUrl,
                              @Value("${supabase.key}") String supabaseKey) {
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        this.httpClient = new OkHttpClient();
    }
    
    // 发送邮箱验证链接
    public void sendEmailVerification(String email) {
        String url = supabaseUrl + "/auth/v1/magiclink";
        
        JSONObject requestBody = new JSONObject();
        requestBody.put("email", email);
        
        RequestBody body = RequestBody.create(
            MediaType.parse("application/json"), requestBody.toString());
            
        Request request = new Request.Builder()
            .url(url)
            .post(body)
            .addHeader("apikey", supabaseKey)
            .addHeader("Content-Type", "application/json")
            .build();
            
        try {
            Response response = httpClient.newCall(request).execute();
            // 处理响应
        } catch (IOException e) {
            // 处理异常
        }
    }
    
    // 重置密码
    public void resetPassword(String email) {
        String url = supabaseUrl + "/auth/v1/recover";
        
        JSONObject requestBody = new JSONObject();
        requestBody.put("email", email);
        
        // 类似上面的实现
    }
}
```

### 5.3 JWT 验证

Supabase 使用 JWT 进行认证，可以在 Spring Security 中验证 Supabase 生成的 JWT：

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeRequests()
            .antMatchers("/api/auth/**").permitAll()
            .anyRequest().authenticated()
            .and()
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }
}
```

## 6. 存储服务集成

### 6.1 文件上传

使用 Supabase Storage API 上传文件：

```java
@Service
public class SupabaseStorageService {
    
    private final String supabaseUrl;
    private final String supabaseKey;
    private final OkHttpClient httpClient;
    
    // 构造函数略
    
    public String uploadFile(String bucketName, String path, byte[] fileData, String contentType) {
        String url = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + path;
        
        RequestBody body = RequestBody.create(MediaType.parse(contentType), fileData);
        
        Request request = new Request.Builder()
            .url(url)
            .post(body)
            .addHeader("apikey", supabaseKey)
            .addHeader("Content-Type", contentType)
            .build();
            
        try {
            Response response = httpClient.newCall(request).execute();
            // 处理响应，返回文件URL
            return supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + path;
        } catch (IOException e) {
            // 处理异常
            return null;
        }
    }
}
```

## 7. 常见问题与解决方案

### 7.1 连接池配置问题

**问题**: Supabase PostgreSQL 连接可能会出现 "too many connections" 错误。

**解决方案**: 适当配置 HikariCP 连接池参数，减少最大连接数，增加连接超时时间。

### 7.2 PREPARE 语句问题

**问题**: Supabase PostgreSQL 可能不支持某些 PREPARE 语句。

**解决方案**: 在 JDBC URL 中添加 `prepareThreshold=0` 参数禁用 PREPARE 语句：

```
jdbc:postgresql://db.sdjbvotskfssjxgzemlw.supabase.co:5432/postgres?prepareThreshold=0
```

### 7.3 RLS 策略问题

**问题**: 使用 JDBC 连接时，Row Level Security (RLS) 策略可能会阻止某些操作。

**解决方案**: 确保使用具有适当权限的数据库角色，或在需要时禁用 RLS：

```sql
-- 临时禁用 RLS
SET LOCAL row_security = off;
```

## 8. 查看加密密码原文

在 Supabase 中，用户密码是经过加密存储的，无法直接查看原文。这是出于安全考虑，即使是数据库管理员也无法查看用户的明文密码。

如果需要重置用户密码，可以通过以下方式：

1. 使用 Supabase Auth API 发送密码重置邮件
2. 在管理员面板中手动重置用户密码
3. 使用 SQL 更新密码哈希值（不推荐，除非特殊情况）

## 9. 管理 auth.users 表权限

Supabase 的 `auth.users` 表是由 Supabase Auth 服务管理的，默认情况下有严格的访问控制。

### 9.1 查看 auth.users 表

可以在 Supabase 管理面板的 "Authentication" -> "Users" 页面查看用户列表。

如果需要通过 SQL 查询，可以使用以下方式：

```sql
-- 需要管理员权限
SELECT * FROM auth.users;
```

### 9.2 插入操作

通常不建议直接向 `auth.users` 表插入数据，而是使用 Supabase Auth API 或管理面板创建用户。

如果确实需要直接插入，可以使用以下 SQL（需要管理员权限）：

```sql
-- 不推荐，仅用于特殊情况
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, ...)
VALUES (...);
```

### 9.3 删除操作

同样，建议使用 Supabase Auth API 或管理面板删除用户。

如果需要直接删除，可以使用以下 SQL（需要管理员权限）：

```sql
-- 不推荐，仅用于特殊情况
DELETE FROM auth.users WHERE id = 'user-id';
```

**注意**: 直接操作 `auth.users` 表可能会导致认证服务出现问题，请谨慎操作。

## 10. 参考资源

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase Auth API 文档](https://supabase.com/docs/reference/api/auth)
- [Supabase Storage API 文档](https://supabase.com/docs/reference/api/storage)
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [Spring Boot 与 PostgreSQL 集成指南](https://spring.io/guides/gs/accessing-data-postgresql/)
