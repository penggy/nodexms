PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS t_menu (
    id          VARCHAR (255) PRIMARY KEY,
    pid         VARCHAR (255),
    title       VARCHAR (255),
    path        VARCHAR (256),
    icon        VARCHAR (255),
    roles       VARCHAR (255),
    sort_number INTEGER       DEFAULT (1) 
);

CREATE TABLE IF NOT EXISTS t_user (
    id              VARCHAR (255) PRIMARY KEY,
    name            VARCHAR (255),
    password        VARCHAR (255),
    roles           VARCHAR (255),
    last_login_time DATETIME,
    regist_time     DATETIME
);

COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
