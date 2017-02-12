/*
	After creating a database in your mysql DB management System
	Call the database scrum12
	Import this file into the database created.
*/

/* creating tables*/

/* create Users table*/
CREATE TABLE IF NOT EXISTS users (
	userid int (10) NOT NULL AUTO_INCREMENT,
	firstname varchar (20) NOT NULL,
	lastname varchar (20) NULL NULL,
	username varchar (20) NOT NULL,
	address varchar (100) NOT NULL,
	performance varchar (10) DEFAULT 'ratings',
	userstatus enum('admin', 'scrum master', 'project owner', 'development team' ) DEFAULT 'development team',
	password varchar(255) NOT NULL,
	avatar varchar(255) NOT NULL,
	gender enum('male', 'female') NOT NULL,

	PRIMARY KEY (userid),
	UNIQUE KEY username (username, address)
); 

/* create Projects table*/
CREATE TABLE IF NOT EXISTS projects (
	projectid int(10) NOT NULL AUTO_INCREMENT,
	title varchar (50) NOT NULL,
	description varchar (255) DEFAULT 'Project description',
	projectstatus varchar (30) DEFAULT 'Project status',
	color varchar (7) DEFAULT '#bb7ed3',
	startingdate datetime NOT NULL,
	endingdate datetime NOT NULL,

	PRIMARY KEY (projectid),
	UNIQUE KEY title (title, color)
);

/* create Tasks table*/
CREATE TABLE IF NOT EXISTS tasks (
	taskid int (10) NOT NULL AUTO_INCREMENT,
	title varchar (50) NOT NULL,
	description varchar (200) DEFAULT 'Task description',
	taskstatus enum ('created', 'in progress', 'blocked', 'completed') DEFAULT 'Created',
	projectid int (10),
	userid int (10),
	startingdate datetime NOT NULL,
	endingdate datetime NULL NULL,
	reason varchar(255) NULL,

	PRIMARY KEY (taskid),
	UNIQUE KEY title (title)
/*	Uncomment this to add the foreign keys
	
	FOREIGN KEY (projectid) REFERENCES projects(projectid),
	FOREIGN KEY (userid) REFERENCES users(userid)
*/
);