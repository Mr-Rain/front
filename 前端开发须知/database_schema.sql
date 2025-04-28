/*
grant usage on schema public to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;
*/
-- 你需要在你的 PostgreSQL 数据库的 resumes 表中添加 file_bucket 列。请执行以下 SQL 命令：
ALTER TABLE resumes ADD COLUMN file_path TEXT;
ALTER TABLE resumes ADD COLUMN file_bucket VARCHAR(255);

-- 在students表中添加教育经历和工作经历字段
ALTER TABLE students ADD COLUMN education_experiences JSONB;
ALTER TABLE students ADD COLUMN work_experiences JSONB;

-- 添加注释
COMMENT ON COLUMN students.education_experiences IS '教育经历（JSON格式）';
COMMENT ON COLUMN students.work_experiences IS '工作经历（JSON格式）';


-- 为students表添加学号字段
ALTER TABLE students ADD COLUMN student_number VARCHAR(64);

-- 为现有记录设置默认学号（使用id作为临时学号）
UPDATE students SET student_number = CONCAT('S', id) WHERE student_number IS NULL;

-- 添加唯一约束，确保学号不重复
ALTER TABLE students ADD CONSTRAINT uk_student_number UNIQUE (student_number);

-- 添加注释
COMMENT ON COLUMN students.student_number IS '学号，唯一标识';

-- 添加期望薪资和期望工作地点字段
ALTER TABLE students 
ADD COLUMN expected_salary VARCHAR(64),
ADD COLUMN expected_location VARCHAR(128);

-- 添加注释
COMMENT ON COLUMN students.expected_salary IS '期望薪资';
COMMENT ON COLUMN students.expected_location IS '期望工作地点';

-- 修改users表中的avatar字段类型
ALTER TABLE users ALTER COLUMN avatar TYPE TEXT;

-- 修改students表中的avatar字段类型
ALTER TABLE students ALTER COLUMN avatar TYPE TEXT;

-- 修改resumes表中的avatar字段类型
ALTER TABLE resumes ALTER COLUMN avatar TYPE TEXT;


ALTER TABLE users ADD COLUMN bio VARCHAR(1000); -- 或者 TEXT 类型，根据需要调整长度
ALTER TABLE users ADD COLUMN update_time TIMESTAMP WITH TIME ZONE;
-- 校园招聘系统数据库结构（PostgreSQL标准）
-- 兼容Spring Boot / Supabase / Django ORM

-- 1. 用户与权限

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(64) UNIQUE NOT NULL,
    email           VARCHAR(128) UNIQUE NOT NULL,
    password_hash   VARCHAR(256) NOT NULL,
    user_type       VARCHAR(16) NOT NULL, -- student/company/admin
    avatar          VARCHAR(256),
    phone           VARCHAR(32),
    status          VARCHAR(16) DEFAULT 'active',
    create_time     TIMESTAMPTZ DEFAULT now(),
    last_login_time TIMESTAMPTZ
);
COMMENT ON TABLE users IS '用户表';

CREATE TABLE roles (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(32) UNIQUE NOT NULL,
    description VARCHAR(128)
);
COMMENT ON TABLE roles IS '角色表';

CREATE TABLE permissions (
    id          BIGSERIAL PRIMARY KEY,
    code        VARCHAR(64) UNIQUE NOT NULL,
    name        VARCHAR(64),
    description VARCHAR(128)
);
COMMENT ON TABLE permissions IS '权限表';

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);
COMMENT ON TABLE user_roles IS '用户-角色关联表';

CREATE TABLE role_permissions (
    role_id       BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);
COMMENT ON TABLE role_permissions IS '角色-权限关联表';

-- 2. 学生与企业

CREATE TABLE students (
    id              BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    real_name        VARCHAR(64),
    gender           VARCHAR(8),
    age              INT,
    phone            VARCHAR(32),
    school           VARCHAR(128),
    major            VARCHAR(128),
    education        VARCHAR(32),
    graduation_year  INT,
    skills           TEXT[],
    introduction     TEXT,
    avatar           VARCHAR(256),
    create_time      TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE students IS '学生表';

CREATE TABLE companies (
    id               BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name      VARCHAR(128) NOT NULL,
    short_name        VARCHAR(64),
    logo              VARCHAR(256),
    website           VARCHAR(128),
    industry          VARCHAR(64),
    scale             VARCHAR(32),
    financing         VARCHAR(32),
    location          VARCHAR(128),
    description       TEXT,
    tags              TEXT[],
    contact_person    VARCHAR(64),
    contact_email     VARCHAR(128),
    contact_phone     VARCHAR(32),
    business_license  VARCHAR(256),
    audit_status      VARCHAR(16) DEFAULT 'pending',
    audit_message     VARCHAR(256),
    submit_time       TIMESTAMPTZ,
    create_time       TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE companies IS '企业表';

-- 3. 职位与简历

CREATE TABLE jobs (
    id                  BIGSERIAL PRIMARY KEY,
    company_id          BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title               VARCHAR(128) NOT NULL,
    location            VARCHAR(64),
    salary_range        VARCHAR(32),
    job_type            VARCHAR(16),
    experience_required VARCHAR(32),
    education_required  VARCHAR(32),
    tags                TEXT[],
    benefits            TEXT[],
    description         TEXT,
    requirements        TEXT,
    publish_time        TIMESTAMPTZ DEFAULT now(),
    status              VARCHAR(16) DEFAULT 'open'
);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
COMMENT ON TABLE jobs IS '职位表';

CREATE TABLE resumes (
    id                BIGSERIAL PRIMARY KEY,
    student_id        BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title             VARCHAR(128),
    is_default        BOOLEAN DEFAULT FALSE,
    name              VARCHAR(64),
    phone             VARCHAR(32),
    email             VARCHAR(128),
    avatar            VARCHAR(256),
    skills_description TEXT,
    self_evaluation   TEXT,
    file_url          VARCHAR(256),
    file_name         VARCHAR(128),
    upload_time       TIMESTAMPTZ,
    create_time       TIMESTAMPTZ DEFAULT now(),
    update_time       TIMESTAMPTZ
);
CREATE INDEX idx_resumes_student_id ON resumes(student_id);
COMMENT ON TABLE resumes IS '简历表';

CREATE TABLE resume_education (
    id         BIGSERIAL PRIMARY KEY,
    resume_id  BIGINT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    school     VARCHAR(128),
    major      VARCHAR(128),
    degree     VARCHAR(32),
    start_date VARCHAR(16),
    end_date   VARCHAR(16),
    description TEXT
);
CREATE INDEX idx_resume_education_resume_id ON resume_education(resume_id);
COMMENT ON TABLE resume_education IS '简历-教育经历表';

CREATE TABLE resume_work (
    id           BIGSERIAL PRIMARY KEY,
    resume_id    BIGINT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    company_name VARCHAR(128),
    position     VARCHAR(64),
    start_date   VARCHAR(16),
    end_date     VARCHAR(16),
    description  TEXT
);
CREATE INDEX idx_resume_work_resume_id ON resume_work(resume_id);
COMMENT ON TABLE resume_work IS '简历-工作/实习经历表';

CREATE TABLE resume_project (
    id           BIGSERIAL PRIMARY KEY,
    resume_id    BIGINT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    project_name VARCHAR(128),
    role         VARCHAR(64),
    start_date   VARCHAR(16),
    end_date     VARCHAR(16),
    description  TEXT,
    project_link VARCHAR(256)
);
CREATE INDEX idx_resume_project_resume_id ON resume_project(resume_id);
COMMENT ON TABLE resume_project IS '简历-项目经历表';

-- 4. 申请与推荐

CREATE TABLE applications (
    id                  BIGSERIAL PRIMARY KEY,
    job_id              BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    student_id          BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    resume_id           BIGINT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    status              VARCHAR(16),
    apply_time          TIMESTAMPTZ DEFAULT now(),
    update_time         TIMESTAMPTZ,
    feedback            TEXT,
    rating              INT,
    interview_time      TIMESTAMPTZ,
    interview_location  VARCHAR(128),
    interview_type      VARCHAR(16),
    interview_contact   VARCHAR(64),
    interview_contact_info VARCHAR(128)
);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_student_id ON applications(student_id);
COMMENT ON TABLE applications IS '职位申请表';

CREATE TABLE recommendations (
    id         BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    job_id     BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    score      FLOAT,
    reason     TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_recommendations_student_id ON recommendations(student_id);
CREATE INDEX idx_recommendations_job_id ON recommendations(job_id);
COMMENT ON TABLE recommendations IS '推荐结果表';

CREATE TABLE feedbacks (
    id            BIGSERIAL PRIMARY KEY,
    student_id    BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    job_id        BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    feedback_type VARCHAR(16),
    feedback_text TEXT,
    created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_feedbacks_student_id ON feedbacks(student_id);
CREATE INDEX idx_feedbacks_job_id ON feedbacks(job_id);
COMMENT ON TABLE feedbacks IS '推荐/职位反馈表';

-- 5. 通知与消息

CREATE TABLE notifications (
    id           BIGSERIAL PRIMARY KEY,
    title        VARCHAR(128),
    content      TEXT,
    type         VARCHAR(16),
    status       VARCHAR(8),
    priority     VARCHAR(8),
    sender_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
    recipient_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    link         VARCHAR(256),
    data         JSONB,
    create_time  TIMESTAMPTZ DEFAULT now(),
    read_time    TIMESTAMPTZ
);
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
COMMENT ON TABLE notifications IS '通知表';

-- 6. 行为日志与搜索

CREATE TABLE search_logs (
    id        BIGSERIAL PRIMARY KEY,
    user_id   BIGINT REFERENCES users(id) ON DELETE CASCADE,
    keyword   VARCHAR(128),
    type      VARCHAR(16),
    filters   JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_search_logs_user_id ON search_logs(user_id);
COMMENT ON TABLE search_logs IS '搜索日志表';

CREATE TABLE action_logs (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(32),
    target_type VARCHAR(32),
    target_id   BIGINT,
    data        JSONB,
    created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_action_logs_user_id ON action_logs(user_id);
COMMENT ON TABLE action_logs IS '行为日志表';

-- 7. 用户设置

CREATE TABLE user_settings (
    id        BIGSERIAL PRIMARY KEY,
    user_id   BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    settings  JSONB,
    updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE user_settings IS '用户设置表';

-- 所有表结构设计完毕

