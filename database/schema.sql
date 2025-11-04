CREATE TABLE students (
  roll_no VARCHAR(20) PRIMARY KEY,
  Name VARCHAR(100),
  Course VARCHAR(50),
  Shift VARCHAR(20),
  Section VARCHAR(5),
  College_id VARCHAR(100) UNIQUE,
  Year INT,
  Email VARCHAR(150),
  Password VARCHAR(255) DEFAULT NULL,
  isFirstLogin SMALLINT DEFAULT 1
);
