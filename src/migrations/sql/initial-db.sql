USE `scheduling_db`;

DROP TABLE IF EXISTS `Users`;
CREATE TABLE `Users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `role` enum('staff','admin') NOT NULL,
  `password` varchar(255) NOT NULL,
  `refreshToken` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

TRUNCATE `Users`;
INSERT INTO `Users` (`id`, `name`, `username`, `role`, `password`, `refreshToken`, `createdAt`, `updatedAt`) VALUES
(1,	'administrator',	'admin',	'admin',	'$2b$08$reiNeLLVFlAUTXJ6YYJsUOQD2ww0Rjt3URFGvxHE8gaAjCZmjUmSW',	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNjU4OTE2NDcwLCJleHAiOjE2NjE1MDg0NzB9.mImIP5P7i6v54fKVi1sA-21Xi_eLtWJiQVPtgtSI_xE',	'2022-07-27 10:06:18',	'2022-07-27 10:07:50'),
(2,	'Staff user 1',	'staff1',	'staff',	'$2b$08$OUOtUGB8osT4wxdOIocjcuXq3tbKNuJd3b6S0qSVgg7nz5XE877ae',	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN0YWZmMSIsImlhdCI6MTY1ODkxNjQxOSwiZXhwIjoxNjYxNTA4NDE5fQ.8MPS6VFOF5VmJ0ifJZvCdBINxt_YnvYrlFdrfQOSlWE',	'2022-07-27 10:06:59',	'2022-07-27 10:06:59'),
(3,	'Staff user 2',	'staff2',	'staff',	'$2b$08$26Pd31KbDnMnE3T1yAqnLO7EWD6xWifnkvyg3d6pST19AQhW0RogW',	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN0YWZmMiIsImlhdCI6MTY1ODkxNjQyNiwiZXhwIjoxNjYxNTA4NDI2fQ.Jx3JiLZ1GH-h_J2Ustwnw86OvYbvioi4bARRDQjMLLA',	'2022-07-27 10:07:06',	'2022-07-27 10:07:06'),
(4,	'Staff user 3',	'staff3',	'staff',	'$2b$08$AYakWglhCKRDaeuSRV0tUucsAcZ/OvOJMbSnhaQzix3tcPX1uOu2e',	NULL,	'2022-07-27 10:09:05',	'2022-07-27 10:09:05'),
(5,	'Staff user 4',	'staff4',	'staff',	'$2b$08$5IbPjV12QgA3ADpzog9Zl.7yWCyMy/4OEpdOuSiOcURMq4GmOMAnC',	NULL,	'2022-07-27 10:12:11',	'2022-07-27 10:12:11'),
(6,	'Staff user 5',	'staff5',	'staff',	'$2b$08$r98uNFp8oFvCYPSAKhVR.enNFd.yZXsY/OJ665BeftBKjjcNiNA/q',	NULL,	'2022-07-27 10:12:18',	'2022-07-27 10:12:18'),
(7,	'Staff user 6',	'staff6',	'staff',	'$2b$08$cSJjU.HBcYNQzq4GZg7EN.NLOebOvgWkUVWV930E6pzbX.qRsrL36',	NULL,	'2022-07-27 10:12:24',	'2022-07-27 10:12:24'),
(8,	'Staff user 7',	'staff7',	'staff',	'$2b$08$cS373xhyswk5ZbKX3HFTHeInoJRv1KUE5B..mkEkzm/NNxmuSGi8C',	NULL,	'2022-07-27 10:12:32',	'2022-07-27 10:12:32');



DROP TABLE IF EXISTS `Schedules`;
CREATE TABLE `Schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `workDate` date NOT NULL,
  `shiftLength` int(11) NOT NULL,
  `completed` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `UserId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `UserId` (`UserId`),
  CONSTRAINT `Schedules_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

TRUNCATE `Schedules`;
INSERT INTO `Schedules` (`id`, `workDate`, `shiftLength`, `completed`, `createdAt`, `updatedAt`, `UserId`) VALUES
(1,	'2022-01-01',	8,	1,	'2022-07-27 10:09:46',	'2022-07-27 10:09:46',	2),
(2,	'2022-02-01',	8,	1,	'2022-07-27 10:09:53',	'2022-07-27 10:09:53',	2),
(3,	'2022-03-01',	8,	1,	'2022-07-27 10:09:57',	'2022-07-27 10:09:57',	2),
(4,	'2022-02-01',	8,	1,	'2022-07-27 10:10:05',	'2022-07-27 10:10:05',	3),
(5,	'2022-03-01',	8,	1,	'2022-07-27 10:10:09',	'2022-07-27 10:10:09',	3),
(6,	'2022-03-01',	8,	1,	'2022-07-27 10:10:14',	'2022-07-27 10:10:14',	4),
(7,	'2022-01-01',	8,	1,	'2022-07-27 10:13:20',	'2022-07-27 10:13:20',	5),
(8,	'2022-02-01',	8,	1,	'2022-07-27 10:13:31',	'2022-07-27 10:13:31',	6),
(9,	'2022-01-01',	8,	1,	'2022-07-27 10:13:39',	'2022-07-27 10:13:39',	7),
(10,	'2022-01-01',	8,	1,	'2022-07-27 10:13:52',	'2022-07-27 10:13:52',	8);

