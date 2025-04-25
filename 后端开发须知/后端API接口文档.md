# 后端 API 接口文档

## 约定

- **Base URL**: `/api` (可以根据实际部署情况调整，例如 `/api/v1`)
- **认证方式**: Bearer Token (JWT)，在请求头中添加 `Authorization: Bearer {token}`
- **请求头**:
  - `Content-Type: application/json`
  - `Authorization: Bearer {token}` (需要认证的接口)
- **响应格式**: 统一使用 JSON 格式，结构如下：
  ```json
  {
    "code": 200, // 业务状态码，非 HTTP 状态码
    "message": "操作成功",
    "data": { ... } // 实际业务数据，可能为对象、数组或 null
  }
  ```
- **业务状态码 (code) 定义**: (建议在 `common/ResultCode.java` 中定义)
  - `200`: 成功
  - `400`: 客户端请求错误 (参数校验失败、格式错误等)
  - `401`: 未认证 (Token 无效或缺失)
  - `403`: 未授权 (用户无权限访问该资源)
  - `404`: 资源未找到
  - `500`: 服务器内部错误
  - `1001`: 用户名已存在
  - `1002`: 邮箱已存在
  - `1003`: 用户名或密码错误
  - `1004`: 账号已被禁用
  - `2001`: 职位不存在
  - `2002`: 职位已关闭
  - `3001`: 简历不存在
  - `4001`: 申请不存在
  - `4002`: 重复申请
  - [其他自定义业务状态码]
- **分页约定**: 
  - 请求参数: `page` (页码, 默认 1), `size` (每页数量, 默认 10)
  - 响应格式 (在 `data` 字段中): 
    ```json
    {
      "total": 100,      // 总记录数
      "pages": 10,       // 总页数
      "current": 1,      // 当前页码
      "size": 10,        // 每页数量
      "records": [ ... ] // 当前页数据列表
    }
    ```

## 1. 用户认证模块 (Auth)

### 1.1 用户注册

- **Path**: `/api/auth/register`
- **Method**: `POST`
- **描述**: 注册新用户。
- **请求体 (Request Body)**:
  ```json
  {
    "username": "string (必填, 4-20位)",
    "password": "string (必填, 6-20位)",
    "email": "string (必填, 邮箱格式)",
    "userType": "string (必填, student/company/admin)",
    "phone": "string (可选, 手机号格式)"
  }
  ```
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "注册成功",
    "data": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "userType": "student",
      "avatar": null,
      "phone": null,
      "status": "active",
      "createTime": "2023-12-25T10:00:00Z"
    }
  }
  ```
- **响应 (Response - 失败)**:
  - `400`: 参数校验失败 (具体错误信息在 message 中)
  - `1001`: 用户名已存在
  - `1002`: 邮箱已存在

### 1.2 用户登录

- **Path**: `/api/auth/login`
- **Method**: `POST`
- **描述**: 用户登录获取 Token。
- **请求体 (Request Body)**:
  ```json
  {
    "username": "string (必填)",
    "password": "string (必填)"
  }
  ```
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "token": "your_jwt_token_string",
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "userType": "student",
      "avatar": null,
      "status": "active",
      "lastLoginTime": "2023-12-25T10:05:00Z"
    }
  }
  ```
- **响应 (Response - 失败)**:
  - `400`: 参数校验失败
  - `1003`: 用户名或密码错误
  - `1004`: 账号已被禁用

### 1.3 发送邮箱验证链接 (使用 Supabase Auth)

- **Path**: `/api/auth/verify-email`
- **Method**: `POST`
- **描述**: 请求发送邮箱验证链接 (调用 Supabase Auth API)。
- **请求体 (Request Body)**:
  ```json
  {
    "email": "string (必填, 邮箱格式)"
  }
  ```
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "验证邮件请求已发送",
    "data": null
  }
  ```
- **响应 (Response - 失败)**:
  - `400`: 邮箱格式错误 / Supabase API 调用失败

### 1.4 重置密码 (使用 Supabase Auth)

- **Path**: `/api/auth/reset-password`
- **Method**: `POST`
- **描述**: 请求发送重置密码邮件 (调用 Supabase Auth API)。
- **请求体 (Request Body)**:
  ```json
  {
    "email": "string (必填, 邮箱格式)"
  }
  ```
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "重置密码邮件请求已发送",
    "data": null
  }
  ```
- **响应 (Response - 失败)**:
  - `400`: 邮箱格式错误 / Supabase API 调用失败

## 2. 用户管理模块 (User)

### 2.1 获取当前用户信息

- **Path**: `/api/users/me`
- **Method**: `GET`
- **描述**: 获取当前登录用户的信息。
- **认证**: 需要 Token
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "userType": "student",
      "avatar": null,
      "phone": null,
      "status": "active",
      "createTime": "2023-12-25T10:00:00Z",
      "lastLoginTime": "2023-12-25T10:05:00Z"
      // 如果是学生或企业，可能包含 studentInfo 或 companyInfo
    }
  }
  ```
- **响应 (Response - 失败)**:
  - `401`: 未认证
  - `404`: 用户信息不存在 (理论上不应发生)

### 2.2 更新用户信息

- **Path**: `/api/users/me`
- **Method**: `PUT`
- **描述**: 更新当前登录用户的信息 (不包括学生/企业专属信息)。
- **认证**: 需要 Token
- **请求体 (Request Body)**:
  ```json
  {
    "phone": "string (可选, 手机号格式)",
    "avatar": "string (可选, 头像URL)"
  }
  ```
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "更新成功",
    "data": {
      // 更新后的用户信息
    }
  }
  ```
- **响应 (Response - 失败)**:
  - `400`: 参数校验失败
  - `401`: 未认证

### 2.3 修改密码

- **Path**: `/api/users/password`
- **Method**: `PUT`
- **描述**: 修改当前用户密码。
- **认证**: 需要 Token
- **请求体 (Request Body)**:
  ```json
  {
    "oldPassword": "string (必填)",
    "newPassword": "string (必填, 6-20位)"
  }
  ```
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "密码修改成功",
    "data": null
  }
  ```
- **响应 (Response - 失败)**:
  - `400`: 参数校验失败 / 原密码错误
  - `401`: 未认证

## 3. 学生信息模块 (Student)

### 3.1 获取学生详细信息

- **Path**: `/api/students/me`
- **Method**: `GET`
- **描述**: 获取当前登录学生用户的详细信息。
- **认证**: 需要 Token，且用户类型为学生
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "id": 1, // 对应 users 表的 ID
      "realName": "张三",
      "gender": "男",
      "age": 22,
      "phone": "13800138000",
      "school": "重庆理工大学",
      "major": "计算机科学与技术",
      "education": "本科",
      "graduationYear": 2025,
      "skills": ["Java", "Spring Boot", "Vue.js"],
      "introduction": "热爱编程，积极向上",
      "avatar": "url_to_avatar",
      "createTime": "2023-12-25T10:00:00Z"
    }
  }
  ```
- **响应 (Response - 失败)**:
  - `401`: 未认证
  - `403`: 非学生用户
  - `404`: 学生信息不存在

### 3.2 更新学生详细信息

- **Path**: `/api/students/me`
- **Method**: `PUT`
- **描述**: 更新当前登录学生用户的详细信息。
- **认证**: 需要 Token，且用户类型为学生
- **请求体 (Request Body)**:
  ```json
  {
    "realName": "string (可选)",
    "gender": "string (可选)",
    "age": "integer (可选)",
    "phone": "string (可选, 手机号格式)",
    "school": "string (可选)",
    "major": "string (可选)",
    "education": "string (可选)",
    "graduationYear": "integer (可选)",
    "skills": ["string" (可选)],
    "introduction": "string (可选)",
    "avatar": "string (可选, 头像URL)"
  }
  ```
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "更新成功",
    "data": { 
        // 更新后的学生详细信息
     }
  }
  ```
- **响应 (Response - 失败)**:
  - `400`: 参数校验失败
  - `401`: 未认证
  - `403`: 非学生用户
  - `404`: 学生信息不存在

## 4. 企业信息模块 (Company)

### 4.1 获取企业详细信息 (公开)

- **Path**: `/api/companies/{companyId}`
- **Method**: `GET`
- **描述**: 获取指定企业的公开信息。
- **认证**: 无需认证
- **路径参数 (Path Parameters)**:
  - `companyId`: 企业 ID (对应 users 表的 ID)
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "id": 2,
      "companyName": "某某科技有限公司",
      "shortName": "某某科技",
      "logo": "url_to_logo",
      "website": "https://www.example.com",
      "industry": "互联网",
      "scale": "100-499人",
      "financing": "B轮",
      "location": "重庆市",
      "description": "一家专注于...的公司",
      "tags": ["高新企业", "技术驱动"],
      "auditStatus": "approved"
      // 不包含联系人、营业执照等私密信息
    }
  }
  ```
- **响应 (Response - 失败)**:
  - `404`: 企业不存在或未审核通过

### 4.2 获取当前企业详细信息 (私有)

- **Path**: `/api/companies/me`
- **Method**: `GET`
- **描述**: 获取当前登录企业用户的详细信息 (包含私密信息)。
- **认证**: 需要 Token，且用户类型为企业
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": { 
        // 完整的企业信息，包括联系人、营业执照URL、审核状态、审核消息等
     }
  }
  ```
- **响应 (Response - 失败)**:
  - `401`: 未认证
  - `403`: 非企业用户
  - `404`: 企业信息不存在

### 4.3 更新企业详细信息

- **Path**: `/api/companies/me`
- **Method**: `PUT`
- **描述**: 更新当前登录企业用户的详细信息。
- **认证**: 需要 Token，且用户类型为企业
- **请求体 (Request Body)**:
  ```json
  {
    "companyName": "string (可选)",
    "shortName": "string (可选)",
    "logo": "string (可选)",
    "website": "string (可选)",
    "industry": "string (可选)",
    "scale": "string (可选)",
    "financing": "string (可选)",
    "location": "string (可选)",
    "description": "string (可选)",
    "tags": ["string" (可选)],
    "contactPerson": "string (可选)",
    "contactEmail": "string (可选, 邮箱格式)",
    "contactPhone": "string (可选, 手机号格式)",
    "businessLicense": "string (可选, 营业执照URL)" 
  }
  ```
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "更新成功，等待重新审核", // 如果修改了关键信息，可能需要重新审核
    "data": { 
        // 更新后的企业详细信息
     }
  }
  ```
- **响应 (Response - 失败)**:
  - `400`: 参数校验失败
  - `401`: 未认证
  - `403`: 非企业用户
  - `404`: 企业信息不存在

## 5. 职位管理模块 (Job)

### 5.1 获取职位列表 (公开)

- **Path**: `/api/jobs`
- **Method**: `GET`
- **描述**: 获取公开的职位列表，支持分页和筛选。
- **认证**: 无需认证
- **请求参数 (Query Parameters)**:
  - `page`: 页码，默认 1
  - `size`: 每页数量，默认 10
  - `keyword`: 关键词搜索 (职位标题, 公司名)
  - `location`: 工作地点
  - `jobType`: 工作类型
  - `salaryRange`: 薪资范围
  - `companyId`: 企业 ID
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": { // 分页格式
      "total": 50,
      "pages": 5,
      "current": 1,
      "size": 10,
      "records": [
        {
          "id": 1,
          "companyId": 2,
          "companyName": "某某科技有限公司",
          "companyLogo": "url_to_logo",
          "title": "Java 开发工程师",
          "location": "重庆",
          "salaryRange": "10-15K",
          "jobType": "全职",
          "experienceRequired": "1-3年",
          "educationRequired": "本科",
          "tags": ["后端", "高并发"],
          "benefits": ["五险一金", "定期体检"],
          "publishTime": "2023-12-20T10:00:00Z",
          // 列表页不返回完整 description 和 requirements
        }
        // ... 更多职位
      ]
    }
  }
  ```

### 5.2 获取职位详情 (公开)

- **Path**: `/api/jobs/{jobId}`
- **Method**: `GET`
- **描述**: 获取指定职位的详细信息。
- **认证**: 无需认证
- **路径参数 (Path Parameters)**:
  - `jobId`: 职位 ID
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "id": 1,
      "companyId": 2,
      "companyName": "某某科技有限公司",
      "companyLogo": "url_to_logo",
      "companyDescription": "公司简介...", // 可能需要关联查询
      "title": "Java 开发工程师",
      "location": "重庆",
      "salaryRange": "10-15K",
      "jobType": "全职",
      "experienceRequired": "1-3年",
      "educationRequired": "本科",
      "tags": ["后端", "高并发"],
      "benefits": ["五险一金", "定期体检"],
      "description": "职位描述详情...",
      "requirements": "职位要求详情...",
      "publishTime": "2023-12-20T10:00:00Z",
      "status": "open"
    }
  }
  ```
- **响应 (Response - 失败)**:
  - `404`: 职位不存在或已关闭

### 5.3 企业发布职位

- **Path**: `/api/jobs`
- **Method**: `POST`
- **描述**: 企业发布新职位。
- **认证**: 需要 Token，且用户类型为企业，且企业已审核通过
- **请求体 (Request Body)**:
  ```json
  {
    "title": "string (必填)",
    "location": "string (可选)",
    "salaryRange": "string (可选)",
    "jobType": "string (可选)",
    "experienceRequired": "string (可选)",
    "educationRequired": "string (可选)",
    "tags": ["string" (可选)],
    "benefits": ["string" (可选)],
    "description": "string (必填)",
    "requirements": "string (必填)"
  }
  ```
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "发布成功",
    "data": { 
        // 新创建的职位信息
     }
  }
  ```
- **响应 (Response - 失败)**:
  - `400`: 参数校验失败
  - `401`: 未认证
  - `403`: 非企业用户或企业未审核通过

### 5.4 企业更新职位

- **Path**: `/api/jobs/{jobId}`
- **Method**: `PUT`
- **描述**: 企业更新已发布的职位信息。
- **认证**: 需要 Token，且用户类型为企业，且企业拥有该职位
- **路径参数 (Path Parameters)**:
  - `jobId`: 职位 ID
- **请求体 (Request Body)**: (同发布职位，所有字段可选)
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "更新成功",
    "data": { 
        // 更新后的职位信息
     }
  }
  ```
- **响应 (Response - 失败)**:
  - `400`: 参数校验失败
  - `401`: 未认证
  - `403`: 非企业用户或无权限操作该职位
  - `404`: 职位不存在

### 5.5 企业管理职位状态 (开启/关闭)

- **Path**: `/api/jobs/{jobId}/status`
- **Method**: `PUT`
- **描述**: 企业开启或关闭职位招聘。
- **认证**: 需要 Token，且用户类型为企业，且企业拥有该职位
- **路径参数 (Path Parameters)**:
  - `jobId`: 职位 ID
- **请求体 (Request Body)**:
  ```json
  {
    "status": "open/closed (必填)"
  }
  ```
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "状态更新成功",
    "data": null
  }
  ```
- **响应 (Response - 失败)**:
  - `400`: 参数校验失败
  - `401`: 未认证
  - `403`: 非企业用户或无权限操作该职位
  - `404`: 职位不存在

## 6. 简历管理模块 (Resume)

### 6.1 获取当前学生简历列表

- **Path**: `/api/resumes`
- **Method**: `GET`
- **描述**: 获取当前登录学生的简历列表。
- **认证**: 需要 Token，且用户类型为学生
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": [
      {
        "id": 1,
        "studentId": 1,
        "title": "我的默认简历",
        "isDefault": true,
        "createTime": "2023-12-21T10:00:00Z",
        "updateTime": "2023-12-22T15:30:00Z",
        "fileUrl": "url_to_resume_file (如果是在线简历则为空)",
        "fileName": "张三的简历.pdf (如果是在线简历则为空)"
        // 列表页可能不包含完整简历内容
      },
      {
        "id": 2,
        "studentId": 1,
        "title": "我的在线简历",
        "isDefault": false,
        "createTime": "2023-12-23T11:00:00Z",
        "updateTime": "2023-12-23T11:00:00Z",
        "fileUrl": null,
        "fileName": null
      }
      // ... 更多简历
    ]
  }
  ```

### 6.2 获取简历详情

- **Path**: `/api/resumes/{resumeId}`
- **Method**: `GET`
- **描述**: 获取指定简历的详细信息 (包含教育、工作、项目经历)。
- **认证**: 需要 Token，且用户拥有该简历 (学生本人或企业查看申请者简历)
- **路径参数 (Path Parameters)**:
  - `resumeId`: 简历 ID
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "id": 1,
      "studentId": 1,
      "title": "我的默认简历",
      "isDefault": true,
      "name": "张三",
      "phone": "13800138000",
      "email": "zhangsan@example.com",
      "avatar": "url_to_avatar",
      "skillsDescription": "熟练掌握 Java, Spring Boot, ...",
      "selfEvaluation": "个人评价...",
      "fileUrl": "url_to_resume_file",
      "fileName": "张三的简历.pdf",
      "uploadTime": "2023-12-21T09:00:00Z",
      "createTime": "2023-12-21T10:00:00Z",
      "updateTime": "2023-12-22T15:30:00Z",
      "education": [
        { "id": 1, "resumeId": 1, "school": "...", ... }
      ],
      "work": [
        { "id": 1, "resumeId": 1, "companyName": "...", ... }
      ],
      "project": [
        { "id": 1, "resumeId": 1, "projectName": "...", ... }
      ]
    }
  }
  ```
- **响应 (Response - 失败)**:
  - `401`: 未认证
  - `403`: 无权限查看该简历
  - `404`: 简历不存在

### 6.3 创建/更新在线简历

- **Path**: `/api/resumes` (创建: POST, 更新: PUT /api/resumes/{resumeId})
- **Method**: `POST` / `PUT`
- **描述**: 创建或更新在线填写的简历信息。
- **认证**: 需要 Token，且用户类型为学生
- **请求体 (Request Body)**: (包含简历所有字段，教育、工作、项目经历为数组)
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "保存成功",
    "data": { // 创建或更新后的简历详情 }
  }
  ```

### 6.4 上传附件简历

- **Path**: `/api/resumes/upload`
- **Method**: `POST`
- **描述**: 上传附件简历文件 (PDF/Word)。
- **认证**: 需要 Token，且用户类型为学生
- **请求体 (Request Body)**: `multipart/form-data`, 包含 `file` 字段
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "上传成功",
    "data": { 
        "id": 3, 
        "studentId": 1,
        "title": "上传的简历", 
        "isDefault": false,
        "fileUrl": "url_to_uploaded_file", 
        "fileName": "我的简历.pdf",
        "uploadTime": "2023-12-25T11:00:00Z"
     }
  }
  ```

### 6.5 删除简历

- **Path**: `/api/resumes/{resumeId}`
- **Method**: `DELETE`
- **描述**: 删除指定的简历。
- **认证**: 需要 Token，且用户拥有该简历
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "删除成功",
    "data": null
  }
  ```

### 6.6 设置默认简历

- **Path**: `/api/resumes/{resumeId}/default`
- **Method**: `PUT`
- **描述**: 将指定简历设为默认简历。
- **认证**: 需要 Token，且用户拥有该简历
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "设置成功",
    "data": null
  }
  ```

## 7. 申请管理模块 (Application)

### 7.1 学生提交职位申请

- **Path**: `/api/applications`
- **Method**: `POST`
- **描述**: 学生使用指定简历申请职位。
- **认证**: 需要 Token，且用户类型为学生
- **请求体 (Request Body)**:
  ```json
  {
    "jobId": 1, // 必填
    "resumeId": 1 // 必填
  }
  ```
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "申请成功",
    "data": { // 新创建的申请记录
      "id": 1,
      "jobId": 1,
      "studentId": 1,
      "resumeId": 1,
      "status": "pending", // 初始状态
      "applyTime": "2023-12-25T12:00:00Z"
    }
  }
  ```
- **响应 (Response - 失败)**:
  - `400`: 参数校验失败
  - `401`: 未认证
  - `403`: 非学生用户
  - `404`: 职位或简历不存在
  - `2002`: 职位已关闭
  - `4002`: 已申请该职位，请勿重复申请

### 7.2 学生获取申请列表

- **Path**: `/api/applications/student`
- **Method**: `GET`
- **描述**: 获取当前学生的所有申请记录。
- **认证**: 需要 Token，且用户类型为学生
- **请求参数 (Query Parameters)**:
  - `page`: 页码，默认 1
  - `size`: 每页数量，默认 10
  - `status`: 申请状态
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": { // 分页格式
      "total": 5,
      "pages": 1,
      "current": 1,
      "size": 10,
      "records": [
        {
          "id": 1,
          "jobId": 1,
          "jobTitle": "Java 开发工程师",
          "companyId": 2,
          "companyName": "某某科技",
          "companyLogo": "url_to_logo",
          "resumeId": 1,
          "resumeTitle": "我的默认简历",
          "status": "pending",
          "applyTime": "2023-12-25T12:00:00Z",
          "updateTime": null
        }
        // ... 更多申请记录
      ]
    }
  }
  ```

### 7.3 学生获取申请详情

- **Path**: `/api/applications/{applicationId}`
- **Method**: `GET`
- **描述**: 获取指定申请记录的详细信息。
- **认证**: 需要 Token，且用户拥有该申请
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": { 
        // 详细的申请信息，包括职位信息、使用的简历信息、面试安排等
     }
  }
  ```

### 7.4 学生撤回申请

- **Path**: `/api/applications/{applicationId}/withdraw`
- **Method**: `PUT`
- **描述**: 学生撤回尚未处理的申请。
- **认证**: 需要 Token，且用户拥有该申请，且申请状态允许撤回
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "撤回成功",
    "data": null
  }
  ```

### 7.5 企业获取申请列表

- **Path**: `/api/applications/company`
- **Method**: `GET`
- **描述**: 获取当前企业收到的所有申请记录。
- **认证**: 需要 Token，且用户类型为企业
- **请求参数 (Query Parameters)**:
  - `page`: 页码，默认 1
  - `size`: 每页数量，默认 10
  - `jobId`: 职位 ID
  - `status`: 申请状态
  - `keyword`: 搜索学生姓名或学校
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": { // 分页格式
      "total": 20,
      "pages": 2,
      "current": 1,
      "size": 10,
      "records": [
        {
          "id": 1,
          "jobId": 1,
          "jobTitle": "Java 开发工程师",
          "studentId": 1,
          "studentName": "张三",
          "studentSchool": "重庆理工大学",
          "resumeId": 1,
          "resumeTitle": "我的默认简历",
          "status": "pending",
          "applyTime": "2023-12-25T12:00:00Z",
          "updateTime": null
        }
        // ... 更多申请记录
      ]
    }
  }
  ```

### 7.6 企业更新申请状态

- **Path**: `/api/applications/{applicationId}/status`
- **Method**: `PUT`
- **描述**: 企业更新申请记录的状态。
- **认证**: 需要 Token，且用户类型为企业，且企业拥有该申请对应的职位
- **请求体 (Request Body)**:
  ```json
  {
    "status": "screening/interview/offer/rejected (必填)",
    "feedback": "string (可选, 拒绝时建议填写)",
    "rating": "integer (可选, 1-5)"
  }
  ```
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "状态更新成功",
    "data": null
  }
  ```

### 7.7 企业安排面试

- **Path**: `/api/applications/{applicationId}/interview`
- **Method**: `POST`
- **描述**: 企业为申请安排面试。
- **认证**: 需要 Token，且用户类型为企业，且企业拥有该申请对应的职位
- **请求体 (Request Body)**:
  ```json
  {
    "interviewTime": "datetime (必填)",
    "interviewLocation": "string (必填)",
    "interviewType": "online/offline (必填)",
    "interviewContact": "string (可选)",
    "interviewContactInfo": "string (可选)"
  }
  ```
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "面试安排成功",
    "data": { // 更新后的申请记录，包含面试信息 }
  }
  ```

## 8. 推荐模块 (Recommendation)

### 8.1 学生获取推荐职位

- **Path**: `/api/recommendations`
- **Method**: `GET`
- **描述**: 获取为当前登录学生推荐的职位列表。
- **认证**: 需要 Token，且用户类型为学生
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": [
      {
        "job": { // 推荐的职位简要信息 (同职位列表)
            "id": 5,
            "companyId": 3,
            "companyName": "智能科技",
            ...
         },
        "score": 0.85,
        "reason": "符合您的技能画像和求职意向"
      }
      // ... 更多推荐职位
    ]
  }
  ```

### 8.2 学生反馈推荐结果

- **Path**: `/api/recommendations/feedback`
- **Method**: `POST`
- **描述**: 学生对推荐的职位进行反馈 (喜欢/不感兴趣)。
- **认证**: 需要 Token，且用户类型为学生
- **请求体 (Request Body)**:
  ```json
  {
    "jobId": 5, // 必填
    "feedbackType": "like/dislike/not_interested (必填)",
    "feedbackText": "string (可选)"
  }
  ```
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "反馈成功",
    "data": null
  }
  ```

## 9. 通知模块 (Notification)

### 9.1 获取当前用户通知列表

- **Path**: `/api/notifications`
- **Method**: `GET`
- **描述**: 获取当前登录用户的通知列表。
- **认证**: 需要 Token
- **请求参数 (Query Parameters)**:
  - `page`: 页码，默认 1
  - `size`: 每页数量，默认 10
  - `type`: 通知类型 (system/application/interview)
  - `status`: 通知状态 (read/unread)
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": { // 分页格式
      "total": 15,
      "pages": 2,
      "current": 1,
      "size": 10,
      "records": [
        {
          "id": 1,
          "title": "您的申请状态已更新",
          "content": "您申请的 Java 开发工程师 职位已被查看",
          "type": "application",
          "status": "unread",
          "priority": "normal",
          "senderId": null, // 系统通知可能为空
          "recipientId": 1,
          "link": "/student/applications/1", // 相关链接
          "data": { "applicationId": 1, "newStatus": "screening" }, // 附加数据
          "createTime": "2023-12-25T14:00:00Z",
          "readTime": null
        }
        // ... 更多通知
      ]
    }
  }
  ```

### 9.2 标记通知已读

- **Path**: `/api/notifications/{notificationId}/read`
- **Method**: `PUT`
- **描述**: 将指定通知标记为已读。
- **认证**: 需要 Token，且用户为通知接收者
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "标记成功",
    "data": null
  }
  ```

### 9.3 标记所有通知已读

- **Path**: `/api/notifications/read-all`
- **Method**: `PUT`
- **描述**: 将当前用户所有未读通知标记为已读。
- **认证**: 需要 Token
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "全部标记成功",
    "data": null
  }
  ```

### 9.4 删除通知

- **Path**: `/api/notifications/{notificationId}`
- **Method**: `DELETE`
- **描述**: 删除指定通知。
- **认证**: 需要 Token，且用户为通知接收者
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "删除成功",
    "data": null
  }
  ```

## 10. 管理员模块 (Admin)

### 10.1 管理员获取用户列表

- **Path**: `/api/admin/users`
- **Method**: `GET`
- **描述**: 管理员获取系统用户列表，支持分页和筛选。
- **认证**: 需要 Token，且用户类型为管理员
- **请求参数 (Query Parameters)**: (同 2.1，增加 userType, status 筛选)
- **响应 (Response - 成功 - 200)**: (同 2.1 返回格式)

### 10.2 管理员更新用户状态

- **Path**: `/api/admin/users/{userId}/status`
- **Method**: `PUT`
- **描述**: 管理员更新用户状态 (启用/禁用)。
- **认证**: 需要 Token，且用户类型为管理员
- **请求体 (Request Body)**:
  ```json
  {
    "status": "active/inactive/banned (必填)"
  }
  ```
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "状态更新成功",
    "data": null
  }
  ```

### 10.3 管理员获取企业列表 (含待审核)

- **Path**: `/api/admin/companies`
- **Method**: `GET`
- **描述**: 管理员获取企业列表，支持分页和筛选审核状态。
- **认证**: 需要 Token，且用户类型为管理员
- **请求参数 (Query Parameters)**: (分页参数, keyword, auditStatus)
- **响应 (Response - 成功 - 200)**: (包含完整企业信息的分页列表)

### 10.4 管理员审核企业

- **Path**: `/api/admin/companies/{companyId}/audit`
- **Method**: `PUT`
- **描述**: 管理员审核企业资质。
- **认证**: 需要 Token，且用户类型为管理员
- **路径参数 (Path Parameters)**:
  - `companyId`: 企业 ID
- **请求体 (Request Body)**:
  ```json
  {
    "auditStatus": "approved/rejected (必填)",
    "auditMessage": "string (可选, 拒绝时必填)"
  }
  ```
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "审核操作成功",
    "data": { // 更新后的企业信息 }
  }
  ```

## 11. 文件上传模块 (File)

### 11.1 上传文件

- **Path**: `/api/files/upload`
- **Method**: `POST`
- **描述**: 通用文件上传接口 (如头像、营业执照、简历附件)。
- **认证**: 需要 Token
- **请求体 (Request Body)**: `multipart/form-data`, 包含 `file` 字段
- **响应 (Response - 成功 - 200)**:
  ```json
  {
    "code": 200,
    "message": "上传成功",
    "data": {
      "url": "url_to_uploaded_file", // 返回文件的访问 URL
      "fileName": "original_filename.ext"
    }
  }
  ```
- **响应 (Response - 失败)**:
  - `400`: 文件为空或格式不支持
  - `401`: 未认证
  - `500`: 文件上传失败 (存储服务错误)